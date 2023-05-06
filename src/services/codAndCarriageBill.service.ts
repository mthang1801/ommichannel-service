import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
	CodAndCarriageBillLogActionStatusEnum,
	CodAndCarriageBillStatusEnum,
	CodAndPostageBillPaymentStatusEnum,
	DeliveryPaymentMethodEnum
} from 'src/common/constants/enum';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { sequelize } from 'src/configs/db';
import { CodAndCarriageBillOverviewDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillOverviewQueryParam.dto';
import { CodAndCarriageBillQueryParamsDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillQueryParams.dto';
import { CreateCodAndCarriageBillDto } from 'src/dtos/requests/codAndCarriageBill/createCodAndCarriageBill.dto';
import { UpdateCodAndCarriageBillDto } from 'src/dtos/requests/codAndCarriageBill/updateCodAndCarriageBill.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import {
	CodAndCarriageBillDto,
	CodAndCarriageBillOverviewResponseDto
} from 'src/dtos/responses/codAndCarriageBill/codAndCarriageBillOverview.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CodAndCarriageBill } from 'src/models/codAndCarriageBill.model';
import { CodAndCarriageBillLog } from 'src/models/codAndCarriageBillLog.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import { getPageOffsetLimit, parseDataSqlizeResponse, typeOf, generateRandomString } from 'src/utils/functions.utils';
import { User } from 'src/models/user.model';
import { CodAndCarriageBillPaymentMethodEnum } from 'src/common/constants/enum';

@Injectable()
export class CodAndCarriageBillService {
	constructor(
		@InjectModel(CodAndCarriageBill)
		private readonly CodAndCarriageBillModel: typeof CodAndCarriageBill,
		@InjectModel(CodAndCarriageBillLog)
		private readonly CodAndCarriageBillLogModel: typeof CodAndCarriageBillLog,
		@InjectModel(OrderDelivery)
		private readonly OrderDeliveryModel: typeof OrderDelivery,
		@InjectModel(User)
		private readonly UserModel: typeof User
	) {}

	async createCodAndCarriageBill(data: CreateCodAndCarriageBillDto, user: IUserAuth): Promise<CodAndCarriageBill> {
		const { sellerId, userId } = user;
		const userInfo = await this.UserModel.findOne({
			where: { id: userId }
		});

		let countOrderDelivery = 0;
		let cod = 0;
		let delivery_cod_fee = 0;
		let shipping_fee = 0;
		let total_amount = 0;

		for (const detail of data.details) {
			const orderDelivery = parseDataSqlizeResponse(
				await this.OrderDeliveryModel.findOne({
					where: { seller_id: sellerId, id: detail.order_delivery_id }
				})
			);
			countOrderDelivery++;
			cod += orderDelivery.cod;
			delivery_cod_fee += orderDelivery.delivery_cod_fee;
			shipping_fee += orderDelivery.shipping_fee;
			if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán ngay']) {
				total_amount += orderDelivery.cod - orderDelivery.delivery_cod_fee;
			} else if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người nhận thanh toán']) {
				total_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			} else if (
				orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán sau']
			) {
				total_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			}
		}

		const codAndCarriageBillData = {
			...data,
			seller_id: sellerId,
			bill_code: 'NTL' + generateRandomString(5).toUpperCase(),
			cod,
			delivery_cod_fee,
			shipping_fee,
			debit_amount: total_amount,
			total_amount,
			quantity: countOrderDelivery,
			created_by: userInfo.fullname
		};
		console.log('test');
		const codAndCarriageBill = await this.CodAndCarriageBillModel.create(codAndCarriageBillData);
		console.log('testtest');
		for (const detail of data.details) {
			await this.OrderDeliveryModel.update(
				{
					cod_and_carriage_bill_id: codAndCarriageBill.id,
					for_control_status: CodAndCarriageBillStatusEnum['Đang đối soát']
				},
				{ where: { seller_id: sellerId, id: detail.order_delivery_id } }
			);
		}

		const codAndCarriageBillLogData = {
			seller_id: sellerId,
			cod_and_carriage_bill_id: codAndCarriageBill.id,
			action_status: CodAndCarriageBillLogActionStatusEnum['Tạo phiếu đối soát'],
			action_by: userInfo.fullname
		};

		const cod_and_carriage_bill = await this.CodAndCarriageBillLogModel.create(codAndCarriageBillLogData);

		await this.updateDebitAmountOrderDelivery(cod_and_carriage_bill.id);

		return codAndCarriageBill;
	}

	async updateCodAndCarriageBill(id: number, user: IUserAuth, data: UpdateCodAndCarriageBillDto): Promise<any> {
		const { sellerId, userId } = user;
		const currentCodAndCarriageBill = await this.CodAndCarriageBillModel.findOne({
			where: { id, seller_id: sellerId }
		});

		if (!currentCodAndCarriageBill) {
			throw new HttpException('Không tìm thấy phiếu đối soát cod.', HttpStatus.NOT_FOUND);
		}

		const userInfo = await this.UserModel.findOne({
			where: { id: userId }
		});

		const newData = {
			...data
		};

		await this.OrderDeliveryModel.update(
			{ cod_and_carriage_bill_id: null, for_control_status: null },
			{ where: { cod_and_carriage_bill_id: id } }
		);

		let countOrderDelivery = 0;
		let cod = 0;
		let delivery_cod_fee = 0;
		let shipping_fee = 0;
		let total_amount = 0;

		for (const detail of data.details) {
			const orderDelivery = parseDataSqlizeResponse(
				await this.OrderDeliveryModel.findOne({
					where: { seller_id: sellerId, id: detail.order_delivery_id }
				})
			);
			await this.OrderDeliveryModel.update(
				{ cod_and_carriage_bill_id: id },
				{ where: { id: detail.order_delivery_id } }
			);
			countOrderDelivery++;
			cod += orderDelivery.cod;
			delivery_cod_fee += orderDelivery.delivery_cod_fee;
			shipping_fee += orderDelivery.shipping_fee;
			if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán ngay']) {
				total_amount += orderDelivery.cod - orderDelivery.delivery_cod_fee;
			} else if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người nhận thanh toán']) {
				total_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			} else if (
				orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán sau']
			) {
				total_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			}
		}

		// if (data?.remove_details?.length) {
		// 	for (const detail of data.remove_details) {
		// 		let detailInfo = await this.OrderDeliveryModel.findOne({
		// 			where: { seller_id: sellerId, id: detail.order_delivery_id }
		// 		});
		// 		cod -= detailInfo.cod;
		// 		shipping_fee -= detailInfo.shipping_fee;
		// 		if (detailInfo.delivery_payment_by == PersonPayDeliveryFee.Shop) {
		// 			total_amount -= detailInfo.cod - detailInfo.shipping_fee;
		// 		} else if (detailInfo.delivery_payment_by == PersonPayDeliveryFee.Customer) {
		// 			total_amount -= detailInfo.cod;
		// 		}
		// 		countOrderDelivery--;
		// 	}
		// }

		// if (data?.more_details?.length) {
		// 	for (const detail of data.more_details) {
		// 		let detailInfo = await this.OrderDeliveryModel.findOne({
		// 			where: { seller_id: sellerId, id: detail.order_delivery_id }
		// 		});
		// 		cod += detailInfo.cod;
		// 		shipping_fee += detailInfo.shipping_fee;
		// 		if (detailInfo.delivery_payment_by == PersonPayDeliveryFee.Shop) {
		// 			total_amount += detailInfo.cod - detailInfo.shipping_fee;
		// 		} else if (detailInfo.delivery_payment_by == PersonPayDeliveryFee.Customer) {
		// 			total_amount += detailInfo.cod;
		// 		}
		// 		countOrderDelivery++;
		// 	}
		// }

		newData['cod'] = cod;
		newData['delivery_cod_fee'] = delivery_cod_fee;
		newData['shipping_fee'] = shipping_fee;
		newData['total_amount'] = total_amount;
		newData['debit_amount'] = total_amount;
		newData['quantity'] = countOrderDelivery;

		if (data.for_control_status == CodAndCarriageBillStatusEnum['Đã đối soát']) {
			if (!data.verified_at) {
				newData['verified_at'] = formatMySQLTimeStamp();
			}
		}

		if (data.payment_status == CodAndPostageBillPaymentStatusEnum['Đã thanh toán']) {
			if (currentCodAndCarriageBill.for_control_status == CodAndCarriageBillStatusEnum['Đang đối soát']) {
				throw new HttpException('Vui lòng đối soát trước khi thanh toán', HttpStatus.CONFLICT);
			}

			if (data.payment_method == CodAndCarriageBillPaymentMethodEnum['Chuyển khoản']) {
				if (!data.payment_ref_code) {
					throw new HttpException('Vui lòng nhập mã tham chiếu.', HttpStatus.BAD_REQUEST);
				}
			}

			newData['debit_amount'] = 0;
			newData['paid_by'] = userInfo.fullname;

			if (!data.payment_at) {
				newData.payment_at = formatMySQLTimeStamp();
			}
		}

		await this.CodAndCarriageBillModel.update(newData, { where: { id } });

		if (data.for_control_status == CodAndCarriageBillStatusEnum['Đã đối soát']) {
			const codAndCarriageBillLogData = {
				seller_id: sellerId,
				cod_and_carriage_bill_id: id,
				action_status: CodAndCarriageBillLogActionStatusEnum['Đã đối soát'],
				action_by: userInfo.fullname
			};

			await this.CodAndCarriageBillLogModel.create(codAndCarriageBillLogData);
		} else {
			const codAndCarriageBillLogData = {
				seller_id: sellerId,
				cod_and_carriage_bill_id: id,
				action_status: CodAndCarriageBillLogActionStatusEnum['Chỉnh sửa phiếu đối soát'],
				action_by: userInfo.fullname
			};

			await this.CodAndCarriageBillLogModel.create(codAndCarriageBillLogData);
		}

		// if (data?.remove_details?.length) {
		// 	for (const detail of data.remove_details) {
		// 		await this.OrderDeliveryModel.update(
		// 			{ cod_and_carriage_bill_id: null, for_control_status: null },
		// 			{ where: { seller_id: sellerId, id: detail.order_delivery_id } }
		// 		);
		// 	}
		// }

		// if (data?.more_details?.length) {
		// 	for (const detail of data.more_details) {
		// 		await this.OrderDeliveryModel.update(
		// 			{ cod_and_carriage_bill_id: id },
		// 			{ where: { seller_id: sellerId, id: detail.order_delivery_id } }
		// 		);
		// 	}
		// }
		await this.updateDebitAmountOrderDelivery(id);

		if (data.for_control_status) {
			await this.OrderDeliveryModel.update(
				{ for_control_status: data.for_control_status },
				{ where: { cod_and_carriage_bill_id: id } }
			);
			if (data.for_control_status == CodAndCarriageBillStatusEnum['Đã huỷ']) {
				await this.OrderDeliveryModel.update(
					{ cod_and_carriage_bill_id: null, for_control_status: null },
					{ where: { seller_id: sellerId, cod_and_carriage_bill_id: id } }
				);
			}
		}
	}

	async updateDebitAmountOrderDelivery(cod_and_carriage_bill_id) {
		const orderDeliveries = await this.OrderDeliveryModel.findAll({ where: { cod_and_carriage_bill_id } });

		for (let orderDelivery of orderDeliveries) {
			let debit_amount = 0;
			if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán ngay']) {
				debit_amount += orderDelivery.cod - orderDelivery.delivery_cod_fee;
			} else if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người nhận thanh toán']) {
				debit_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			} else if (
				orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán sau']
			) {
				debit_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			}
			if (debit_amount < 0) {
				debit_amount = 0;
			}
			await this.OrderDeliveryModel.update({ debit_amount }, { where: { id: orderDelivery.id } });
		}
	}

	async getCodAndCarriageBillList(
		seller_id,
		queryParams: CodAndCarriageBillQueryParamsDto
	): Promise<ResponseAbstractList<CodAndCarriageBill>> {
		const { q, shipping_unit_id, payment_status, for_control_status, from_date, to_date } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					bill_code: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (shipping_unit_id) {
			_whereClause = {
				..._whereClause,
				shipping_unit_id
			};
		}
		if (for_control_status) {
			_whereClause = {
				..._whereClause,
				for_control_status
			};
		}
		if (payment_status) {
			_whereClause = {
				..._whereClause,
				payment_status
			};
		}
		if (from_date || to_date) {
			_whereClause = {
				..._whereClause,
				created_at: { [Op.between]: [from_date, to_date] }
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.CodAndCarriageBillModel.findAndCountAll({
				where: _whereClause,
				include: [ShippingUnit],
				order: [['updated_at', 'DESC']],
				offset,
				limit,
				distinct: true
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

	async getCodAndCarriageBillById(sellerId, id): Promise<CodAndCarriageBill> {
		return this.CodAndCarriageBillModel.findOne({
			where: { seller_id: sellerId, id },
			include: [ShippingUnit, OrderDelivery, CodAndCarriageBillLog]
		});
	}

	async getOverview(
		{ roleCode, sellerId }: IUserAuth,
		queryParams: CodAndCarriageBillOverviewDto
	): Promise<CodAndCarriageBillOverviewResponseDto> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = CodAndCarriageBillOverviewDto.getCodAndCarriageBillOverviewQueryParam(
			sellerId,
			queryParams,
			isSpecialAdmin
		);

		const sqlString = Object.values(CodAndCarriageBillStatusEnum)
			.map((forControlStatusId) =>
				typeOf(forControlStatusId) === 'number'
					? this.codAndCarriageOverviewSelectString(forControlStatusId, whereClause)
					: undefined
			)
			.filter(Boolean)
			.join(' UNION ALL ');

		const response = await sequelize.query(sqlString);
		const details = response[0] as CodAndCarriageBillDto[];
		const summary = details.reduce(
			(acc, ele: CodAndCarriageBillDto) => {
				acc.billCount += Number(ele.billCount);
				acc.COD += Number(ele.COD);
				acc.shippingFee += Number(ele.shippingFee);
				return acc;
			},
			{
				billCount: 0,
				COD: 0,
				shippingFee: 0
			}
		);
		return {
			details,
			summary
		};
	}

	codAndCarriageOverviewSelectString(forControlStatusId, whereClause: string) {
		return `
			SELECT 
				for_control_status,
				IFNULL(count(*),0) as billCount,
				IFNULL(SUM(cod) + 0E0,0) as COD,
				IFNULL(SUM(shipping_fee + 0E0),0) as shippingFee,
				(
					CASE for_control_status
					when 1 then "Mới"
					WHEN 2 THEN "Đang đối soát"
					ELSE "Đã đối soát"
				END
				) as forControlStatusName
			FROM
				cod_and_carriage_bills 
			WHERE ${[whereClause, `for_control_status = ${forControlStatusId}`].filter(Boolean).join(' AND ')} 
		`;
	}

	async useOne() {
		let orderDeliveries = await this.OrderDeliveryModel.findAll();

		for (let orderDelivery of orderDeliveries) {
			let debit_amount = 0;
			if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán ngay']) {
				debit_amount += orderDelivery.cod - orderDelivery.delivery_cod_fee;
			} else if (orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người nhận thanh toán']) {
				debit_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			} else if (
				orderDelivery.delivery_payment_method_id == DeliveryPaymentMethodEnum['Người gửi thanh toán sau']
			) {
				debit_amount += orderDelivery.cod - orderDelivery.shipping_fee - orderDelivery.delivery_cod_fee;
			}
			await this.OrderDeliveryModel.update({ debit_amount }, { where: { id: orderDelivery.id } });
		}
	}
}
