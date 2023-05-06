import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import {
	getPageOffsetLimit,
	parseDataSqlizeResponse,
	generateRandomString,
	geneUniqueKey
} from 'src/utils/functions.utils';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Coupon } from 'src/models/coupon.model';
import { CouponApplication } from 'src/models/couponApplication.model';
import { CouponDetail } from 'src/models/couponDetails.model';
import { CreateCouponDto } from 'src/dtos/requests/coupon/createCoupon.dto';
import { CouponQueryParamsDto } from 'src/dtos/requests/coupon/couponQueryParams.dto';
import { CheckDetailDto } from 'src/dtos/requests/coupon/checkDetail.dto';
import { UpdateCouponDto } from 'src/dtos/requests/coupon/updateCoupon.dto';
import { GenCouponDetailCodeDto } from 'src/dtos/requests/coupon/genCouponDetailCode.dto';
import { CouponApplyTypeEnum, CouponDiscountTypeEnum, CouponStatusEnum } from 'src/common/constants/enum';
import { Category } from 'src/models/category.model';
import { Product } from 'src/models/product.model';
import { UpdateStatusCouponListDto } from 'src/dtos/requests/coupon/updateStatusCouponList.dto';
import { ApplyCouponDto } from 'src/dtos/requests/coupon/applyCoupon.dto';
import { formatMySQLTimeStamp } from '../utils/dates.utils';
import { ProductCategory } from 'src/models/productCategory.model';
import { ApplyCouponSuccessDto } from 'src/dtos/requests/coupon/applyCouponSuccess.dto';

@Injectable()
export class CouponService {
	constructor(
		@InjectModel(Coupon)
		private readonly CouponModel: typeof Coupon,
		@InjectModel(CouponApplication)
		private readonly CouponApplicationModel: typeof CouponApplication,
		@InjectModel(CouponDetail)
		private readonly CouponDetailModel: typeof CouponDetail,
		@InjectModel(Category)
		private readonly CategoryModel: typeof Category,
		@InjectModel(Product)
		private readonly ProductModel: typeof Product,
		@InjectModel(ProductCategory)
		private readonly ProductCategoryModel: typeof ProductCategory
	) {}

	async createCoupon(data: CreateCouponDto, user: IUserAuth): Promise<any> {
		const { sellerId, userId, roleCode } = user;

		if (data.coupon_code) {
			const checkCouponCode = await this.CouponModel.findOne({
				where: { coupon_code: data.coupon_code }
			});
			if (checkCouponCode) {
				throw new HttpException('Trùng mã chương trình', HttpStatus.CONFLICT);
			}
		}

		if (data.discount_type == CouponDiscountTypeEnum['Giảm theo số tiền']) {
			delete data.max_discount_amount;
		}

		const couponData = {
			...data,
			seller_id: sellerId,
			utm_sources: data.utm_sources ? data.utm_sources.join(',') : null,
			apply_for_customer_rankings: data.apply_for_customer_rankings
				? data.apply_for_customer_rankings.join(',')
				: null
		};

		const coupon = await this.CouponModel.create(couponData as any);

		if (data.entities && data.entities.length) {
			for (let entity of data.entities) {
				let entityData = {
					entity_id: entity.entity_id,
					seller_id: sellerId,
					coupon_id: coupon.id,
					min_product_amount: entity?.min_product_amount,
					coupon_apply_type: data.coupon_apply_type
				};

				await this.CouponApplicationModel.create(entityData);
			}
		}

		if (data.coupon_detail_codes && data.coupon_detail_codes.length) {
			for (let coupon_detail_code of data.coupon_detail_codes) {
				let checkExistCoupon = await this.CouponDetailModel.findOne({
					where: { coupon_detail_code: coupon_detail_code.coupon_detail_code }
				});
				if (checkExistCoupon) {
					continue;
				}

				let couponDetailData = {
					coupon_detail_code: coupon_detail_code.coupon_detail_code,
					seller_id: sellerId,
					coupon_id: coupon.id,
					status: coupon_detail_code?.status,
					remain: data?.max_used
				};

				await this.CouponDetailModel.create(couponDetailData);
			}

			await this.CouponModel.update(
				{ number_of_codes: data.coupon_detail_codes.length },
				{ where: { id: coupon.id } }
			);
		}

		return coupon;
	}

	async checkDetail(data: CheckDetailDto): Promise<any> {
		const check = await this.CouponDetailModel.findOne({ where: { coupon_detail_code: data.coupon_detail_code } });
		console.log('test');
		if (check) {
			return { response: false };
		}

		return { response: true };
	}

	async updateCoupon(user: IUserAuth, id: number, data: UpdateCouponDto): Promise<any> {
		const { sellerId } = user;

		const currentCoupon = await this.CouponModel.findOne({ where: { seller_id: sellerId, id } });

		if (!currentCoupon) {
			throw new HttpException('Không tìm thấy chương trình mã giảm giá.', HttpStatus.NOT_FOUND);
		}

		if (data.coupon_code) {
			const checkCouponCode = await this.CouponModel.findOne({
				where: { coupon_code: data.coupon_code, id: { [Op.ne]: id } }
			});
			if (checkCouponCode) {
				throw new HttpException('Trùng mã chương trình', HttpStatus.CONFLICT);
			}
		}

		const couponData = {
			...data,
			utm_sources: data.utm_sources ? data.utm_sources.join(',') : currentCoupon.utm_sources,
			apply_for_customer_rankings: data.apply_for_customer_rankings
				? data.apply_for_customer_rankings.join(',')
				: currentCoupon.apply_for_customer_rankings
		};

		await this.CouponModel.update(couponData, { where: { seller_id: sellerId, id } });

		//Chỉnh sửa danh sách (sản phẩm, danh mục) mà mã áp dụng
		if (data.entities && data.entities.length) {
			//Chuyển loại áp dụng (tất cả sản phẩm, danh mục, sản phẩm cụ thể)
			if (data.coupon_apply_type != currentCoupon.coupon_apply_type) {
				await this.CouponApplicationModel.destroy({ where: { seller_id: sellerId, coupon_id: id } });

				for (let entity of data.entities) {
					let entityData = {
						entity_id: entity.entity_id,
						seller_id: sellerId,
						coupon_id: id,
						min_product_amount: entity?.min_product_amount,
						coupon_apply_type: data.coupon_apply_type
					};

					await this.CouponApplicationModel.create(entityData);
				}
			} else {
				//Giữ nguyên loại áp dụng (tất cả sản phẩm, danh mục, sản phẩm cụ thể)
				if (data.removed_entity_ids && data.removed_entity_ids.length) {
					for (let entity_id of data.removed_entity_ids) {
						await this.CouponApplicationModel.destroy({ where: { coupon_id: id, entity_id } });
					}
				}

				if (data.entities && data.entities.length) {
					for (let entity of data.entities) {
						let checkEntityExist = await this.CouponApplicationModel.findOne({
							where: { entity_id: entity.entity_id, coupon_id: id }
						});
						if (!checkEntityExist) {
							let entityData = {
								seller_id: sellerId,
								coupon_id: id,
								entity_id: entity.entity_id,
								min_product_amount: entity?.min_product_amount,
								coupon_apply_type: data.coupon_apply_type
							};

							await this.CouponApplicationModel.create(entityData as any);
						}
					}
				}
			}
		}

		//Chỉnh sửa danh sách mã coupon
		if (data.removed_coupon_detail_ids && data.removed_coupon_detail_ids.length) {
			for (let detail_id of data.removed_coupon_detail_ids) {
				await this.CouponDetailModel.destroy({ where: { id: detail_id } });
			}
		}

		if (data.coupon_details && data.coupon_details.length) {
			for (let detail of data.coupon_details) {
				console.log(detail);
				let checkDetailExist = await this.CouponDetailModel.findOne({
					where: { coupon_detail_code: detail.coupon_detail_code }
				});
				if (!checkDetailExist) {
					let checkExistCoupon = await this.CouponDetailModel.findOne({
						where: { coupon_detail_code: detail.coupon_detail_code }
					});
					if (checkExistCoupon) {
						continue;
					}

					let newDetailData = {
						coupon_detail_code: detail.coupon_detail_code,
						status: detail.status,
						seller_id: sellerId,
						coupon_id: id
					};
					await this.CouponDetailModel.create(newDetailData as any);
				} else {
					await this.CouponDetailModel.update(detail, {
						where: { seller_id: sellerId, coupon_id: id, coupon_detail_code: detail.coupon_detail_code }
					});
				}
			}
		}

		if (data.max_used && data.max_used != currentCoupon.max_used) {
			await this.CouponDetailModel.update({ remain: data.max_used }, { where: { coupon_id: id } });
		}

		await this.CouponModel.update({ number_of_codes: data.coupon_details.length }, { where: { id: id } });
	}

	async updateStatusCouponList(user: IUserAuth, data: UpdateStatusCouponListDto): Promise<any> {
		const { sellerId } = user;
		for (const id of data.coupon_ids) {
			const coupon = await this.CouponModel.findOne({ where: { id } });

			await this.checkUpdateStatusPermission(id, sellerId, coupon.status, data);

			// switch (coupon.status) {
			// 	case CouponStatusEnum['Chưa kích hoạt']:
			// 		if (data.status == CouponStatusEnum['Hoạt động']) {
			// 			await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
			// 		} else {
			// 			throw new HttpException(
			// 				'Đang ở trạng thái chưa kích hoạt, chỉ được chuyển sang trạng thái hoạt động.',
			// 				HttpStatus.BAD_REQUEST
			// 			);
			// 		}
			// 		break;
			// 	case CouponStatusEnum['Hoạt động']:
			// 		if (
			// 			data.status == CouponStatusEnum['Tạm dừng'] ||
			// 			data.status == CouponStatusEnum['Ngừng hoạt động']
			// 		) {
			// 			await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
			// 		} else {
			// 			throw new HttpException(
			// 				'Đang ở trạng thái chưa hoạt động, chỉ được chuyển sang trạng thái tạm dừng hoặc ngừng hoạt động.',
			// 				HttpStatus.BAD_REQUEST
			// 			);
			// 		}
			// 		break;
			// 	case CouponStatusEnum['Tạm dừng']:
			// 		if (
			// 			data.status == CouponStatusEnum['Hoạt động'] ||
			// 			data.status == CouponStatusEnum['Ngừng hoạt động']
			// 		) {
			// 			await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
			// 		} else {
			// 			throw new HttpException(
			// 				'Đang ở trạng thái tạm dừng, chỉ được chuyển sang trạng thái hoạt động hoặc ngừng hoạt động.',
			// 				HttpStatus.BAD_REQUEST
			// 			);
			// 		}
			// 		break;
			// }
		}
	}

	async getCouponList(seller_id: number, queryParams: CouponQueryParamsDto): Promise<ResponseAbstractList<Coupon>> {
		const { q, start_at, end_at, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					coupon_code: {
						[Op.like]: `%${q}%`
					},
					coupon_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status
			};
		}

		if (start_at) {
			_whereClause = {
				..._whereClause,
				start_at: {
					[Op.gte]: start_at + ' 00:00:00'
				}
			};
		}

		if (end_at) {
			_whereClause = {
				..._whereClause,
				end_at: {
					[Op.lte]: end_at + ' 23:59:59'
				}
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.CouponModel.findAndCountAll({
				where: _whereClause,
				order: [['updated_at', 'DESC']],
				limit,
				distinct: true,
				offset
			})
		);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getCouponById(id): Promise<Coupon> {
		const coupon = parseDataSqlizeResponse(
			await this.CouponModel.findOne({
				where: { id },
				include: [{ model: CouponApplication }, { model: CouponDetail }]
			})
		);

		if (coupon.coupon_apply_type == CouponApplyTypeEnum['Danh mục']) {
			for (let entity of coupon.coupon_applications) {
				let category = parseDataSqlizeResponse(
					await this.CategoryModel.findOne({ where: { id: entity.entity_id } })
				);
				category['category_id'] = category.id;
				entity['category'] = category;
			}
		}

		if (coupon.coupon_apply_type == CouponApplyTypeEnum['Sản phẩm']) {
			for (let entity of coupon.coupon_applications) {
				let product = parseDataSqlizeResponse(
					await this.ProductModel.findOne({ where: { id: entity.entity_id } })
				);
				product['product_id'] = product.id;
				entity['product'] = product;
			}
		}

		return coupon;
	}

	async getRandomCode(sellerId): Promise<any> {
		const code = geneUniqueKey().toUpperCase();
		const res = sellerId + 'OMS' + code;

		return res;
	}

	async getCouponProgramCode(sellerId): Promise<any> {
		while (true) {
			let couponCode = await this.getRandomCode(sellerId);
			let checkCode = await this.CouponModel.findOne({ where: { coupon_code: couponCode } });
			if (!checkCode) {
				return { coupon_code: couponCode };
			}
		}
	}

	async getCouponDetailCode(data: GenCouponDetailCodeDto): Promise<any> {
		let coupon_detail_codes: string[] = [];
		let count = 0;

		if (data.prefix.length > 10) {
			throw new HttpException('Tiếp đầu ngữ tối đa 10 ký tự.', HttpStatus.BAD_REQUEST);
		}
		if (data.character_amount < 6 || data.character_amount > 20) {
			throw new HttpException('Số ký tự ngẫu nhiên tối thiểu là 6 và tối đa là 20.', HttpStatus.BAD_REQUEST);
		}
		if (data.suffix.length > 10) {
			throw new HttpException('Hậu tố tối đa 10 ký tự.', HttpStatus.BAD_REQUEST);
		}
		if (data.code_amount > 1000) {
			throw new HttpException('Số lượng mã tối đa là 10 mã.', HttpStatus.BAD_REQUEST);
		}

		while (count < data.code_amount) {
			let coupon_detail_code =
				data.prefix.toUpperCase() +
				generateRandomString(data.character_amount).toUpperCase() +
				data.suffix.toUpperCase();

			let checkDetailCode = await this.CouponDetailModel.findOne({ where: { coupon_detail_code } });

			if (!checkDetailCode) {
				coupon_detail_codes.push(coupon_detail_code);
				count++;
			}
		}

		return { coupon_detail_codes };
	}

	async checkUpdateStatusPermission(id, sellerId, status, data: UpdateStatusCouponListDto) {
		switch (status) {
			case CouponStatusEnum['Chưa kích hoạt']:
				if (data.status == CouponStatusEnum['Hoạt động']) {
					await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
				} else {
					throw new HttpException(
						'Đang ở trạng thái chưa kích hoạt, chỉ được chuyển sang trạng thái hoạt động.',
						HttpStatus.BAD_REQUEST
					);
				}
				break;
			case CouponStatusEnum['Hoạt động']:
				if (data.status == CouponStatusEnum['Tạm dừng'] || data.status == CouponStatusEnum['Ngừng hoạt động']) {
					await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
				} else {
					throw new HttpException(
						'Đang ở trạng thái chưa hoạt động, chỉ được chuyển sang trạng thái tạm dừng hoặc ngừng hoạt động.',
						HttpStatus.BAD_REQUEST
					);
				}
				break;
			case CouponStatusEnum['Tạm dừng']:
				if (
					data.status == CouponStatusEnum['Hoạt động'] ||
					data.status == CouponStatusEnum['Ngừng hoạt động']
				) {
					await this.CouponModel.update({ status: data.status }, { where: { seller_id: sellerId, id } });
				} else {
					throw new HttpException(
						'Đang ở trạng thái tạm dừng, chỉ được chuyển sang trạng thái hoạt động hoặc ngừng hoạt động.',
						HttpStatus.BAD_REQUEST
					);
				}
				break;
		}
	}

	// checkPermission(status, data: UpdateCouponDto) {
	// 	switch (status) {
	// 		case CouponStatusEnum['Chưa kích hoạt']:
	// 			break;
	// 		case CouponStatusEnum['Hoạt động']:
	// 			break;
	// 		case CouponStatusEnum['Tạm dừng']:
	// 			break;
	// 		case CouponStatusEnum['Ngừng hoạt động']:
	// 			if (data) {
	// 				throw new HttpException(
	// 					'Đang ở trạng thái ngưng hoạt động, không thể cập nhật.',
	// 					HttpStatus.BAD_REQUEST
	// 				);
	// 			}
	// 			break;
	// 	}
	// }

	async applyCoupon(user: IUserAuth, data: ApplyCouponDto): Promise<any> {
		const { sellerId } = user;

		const couponDetail = await this.CouponDetailModel.findOne({
			where: { seller_id: sellerId, coupon_detail_code: data.code }
		});

		if (!couponDetail) {
			throw new HttpException('Mã coupon không tồn tại.', HttpStatus.NOT_FOUND);
		}

		const coupon = await this.CouponModel.findOne({ where: { id: couponDetail.coupon_id } });

		if (coupon.status != CouponStatusEnum['Hoạt động']) {
			throw new HttpException('Chương trình mã giảm giá đang không hoạt động.', HttpStatus.BAD_REQUEST);
		}

		const arrOfStr = coupon.utm_sources.split(',');

		const arrOfNum = arrOfStr.map((element) => {
			return Number(element);
		});

		if (!arrOfNum.includes(data.utm_source)) {
			throw new HttpException('Nguồn đơn hàng này không được sử dụng mã coupon này.', HttpStatus.BAD_REQUEST);
		}

		if (couponDetail.status == false) {
			throw new HttpException('Mã coupon đang bị khoá.', HttpStatus.NOT_FOUND);
		}

		if (couponDetail.remain) {
			if (couponDetail.remain <= 0) {
				throw new HttpException('Mã coupon đã hết lượt sử dụng.', HttpStatus.NOT_FOUND);
			}
		}

		if (formatMySQLTimeStamp() < formatMySQLTimeStamp(coupon.start_at)) {
			throw new HttpException('Mã coupon chưa đến ngày sử dụng.', HttpStatus.BAD_REQUEST);
		}

		if (formatMySQLTimeStamp(coupon.end_at) < formatMySQLTimeStamp()) {
			throw new HttpException('Mã coupon đã hết hạn sử dụng.', HttpStatus.BAD_REQUEST);
		}

		if (coupon.order_price_from) {
			if (data.order_total_amount < coupon.order_price_from) {
				throw new HttpException(
					'Giá trị đơn hàng chưa đạt giá trị tối thiểu để sử dụng coupon.',
					HttpStatus.BAD_REQUEST
				);
			}
		}

		let applicable_amount = 0;
		let discount_amount = 0;

		if (coupon.coupon_apply_type == CouponApplyTypeEnum['Tất cả sản phẩm']) {
			for (let product of data.products) {
				const productInfo = await this.ProductModel.findOne({ where: { id: product.id } });
				applicable_amount += productInfo.retail_price * product.amount;

				// switch (coupon.discount_type) {
				// 	case CouponDiscountTypeEnum['Giảm theo số tiền']:
				// 		discount_amount =
				// 			coupon.discount_amount > productInfo.retail_price
				// 				? productInfo.retail_price
				// 				: coupon.discount_amount;
				// 		obj = { id: product.id, discount_amount: discount_amount * product.amount };
				// 		result.push(obj);
				// 		break;
				// 	case CouponDiscountTypeEnum['Giảm theo %']:
				// 		let amount = (productInfo.retail_price / 100) * coupon.discount_amount;

				// 		if (coupon.max_discount_amount) {
				// 			const tempDiscountAmount = Math.round(amount) * product.amount;
				// 			discount_amount =
				// 				tempDiscountAmount > coupon.max_discount_amount
				// 					? coupon.max_discount_amount
				// 					: tempDiscountAmount;
				// 		} else {
				// 			discount_amount = Math.round(amount) * product.amount;
				// 		}
				// 		obj = { id: product.id, discount_amount };
				// 		result.push(obj);
				// 		break;
				// }
			}
		} else if (coupon.coupon_apply_type == CouponApplyTypeEnum['Sản phẩm']) {
			for (let product of data.products) {
				const productInfo = await this.ProductModel.findOne({ where: { id: product.id } });

				//Kiểm tra xem sản phẩm có nằm trong danh sách sản phẩm được áp mã coupon hay không, nếu có thì kiểm tra tiếp số lượng sản phẩm có thoả số lượng sản phẩm tối thiểu hay không
				const couponApplication = await this.CouponApplicationModel.findOne({
					where: { entity_id: product.id, coupon_id: coupon.id }
				});
				if (!couponApplication) {
					continue;
				} else {
					if (product.amount < couponApplication.min_product_amount) {
						continue;
					}
				}

				applicable_amount += productInfo.retail_price * product.amount;
			}
		} else if (coupon.coupon_apply_type == CouponApplyTypeEnum['Danh mục']) {
			for (let product of data.products) {
				const productInfo = await this.ProductModel.findOne({ where: { id: product.id } });

				//Kiểm tra xem sản phẩm có nằm trong danh sách sản phẩm được áp mã coupon hay không, nếu có thì kiểm tra tiếp số lượng sản phẩm có thoả số lượng sản phẩm tối thiểu hay không
				const productCategory = await this.ProductCategoryModel.findOne({ where: { product_id: product.id } });
				if (!productCategory) {
					continue;
				}
				const couponApplication = await this.CouponApplicationModel.findOne({
					where: { entity_id: productCategory.category_id, coupon_id: coupon.id }
				});
				if (!couponApplication) {
					continue;
				} else {
					if (product.amount < couponApplication.min_product_amount) {
						continue;
					}
				}

				applicable_amount += productInfo.retail_price * product.amount;
			}
		}

		switch (coupon.discount_type) {
			case CouponDiscountTypeEnum['Giảm theo số tiền']:
				discount_amount =
					coupon.discount_amount > applicable_amount ? applicable_amount : coupon.discount_amount;
				break;
			case CouponDiscountTypeEnum['Giảm theo %']:
				let amount = Math.round((applicable_amount / 100) * coupon.discount_amount);

				if (coupon.max_discount_amount) {
					discount_amount = amount > coupon.max_discount_amount ? coupon.max_discount_amount : amount;
				} else {
					discount_amount = amount;
				}
				break;
		}

		return { discount_amount };
	}

	async applyCouponSuccess(user: IUserAuth, data: ApplyCouponSuccessDto) {
		if (!data.code) {
			return;
		}

		const { sellerId } = user;

		const couponDetail = await this.CouponDetailModel.findOne({
			where: { seller_id: sellerId, coupon_detail_code: data.code }
		});

		if (couponDetail) {
			const coupon = await this.CouponModel.findOne({ where: { id: couponDetail.coupon_id } });
			if (coupon) {
				await this.CouponModel.update(
					{ total_discount_amount: coupon.total_discount_amount + data.total_discount_amount },
					{ where: { id: coupon.id } }
				);
			}
		}
	}
}
