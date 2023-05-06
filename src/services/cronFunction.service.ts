import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CronFunction } from 'src/models/cronFunction.model';
import { CronFunctionQueryParamsDto } from 'src/dtos/requests/cronFunction/cronFunctionQueryParams.dto';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';
import { CronFunctionPayloadDto } from 'src/dtos/cronFunctionPayload.dto';
import { CreateCronFunctionDto } from 'src/dtos/requests/cronFunction/createCronFunction.dto';
import { DataTypes } from 'src/models/dataType.model';
import { parseDataSqlizeResponse, getPageOffsetLimit } from 'src/utils/functions.utils';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { CronFunctionScheduler } from 'src/models/cronFunctionScheduler.model';
import { SellerPlatform } from 'src/models/sellerPlatform.model';
import { UpdateCronFunctionDto } from 'src/dtos/requests/cronFunction/updateCronFunction.dto';

@Injectable()
export class CronFunctionService {
	constructor(
		@InjectModel(CronFunction)
		private readonly CronFunctionModel: typeof CronFunction,
		@InjectModel(CronFunctionScheduler)
		private readonly CronFunctionSchedulerModel: typeof CronFunctionScheduler,
		@InjectModel(SellerPlatform)
		private readonly SellerPlatformModel: typeof SellerPlatform
	) {}

	async createCronFunction(data: CreateCronFunctionDto, sellerId: number): Promise<void | CronFunction> {
		const sellerPlatform = await this.SellerPlatformModel.findOne({
			where: { seller_id: sellerId, platform_id: data.platform_id }
		});

		if (!sellerPlatform) {
			throw new HttpException('Chưa kết nối tới sàn.', HttpStatus.NOT_FOUND);
		}

		const cronFunction = parseDataSqlizeResponse(
			await this.CronFunctionModel.findOne({
				where: {
					seller_id: sellerId,
					platform_id: data.platform_id,
					data_type_id: data.data_type_id
				}
			})
		);

		if (cronFunction) {
			throw new HttpException('Cron function đã tồn tại.', 400);
		}

		const payload: CronFunctionPayloadDto = {
			...data,
			seller_id: sellerId
		};

		return this.CronFunctionModel.create(payload as any);
	}

	async updateCronFunction(id: number, data: UpdateCronFunctionDto): Promise<any> {
		// if (payload.platform_id) {
		// 	const cronFunctionScheduler =
		// 		await this.CronFunctionSchedulerModel.findOne({
		// 			where: { cron_function_id: id }
		// 		});
		// 	if (cronFunctionScheduler) {
		// 		throw new HttpException(
		// 			'Không thể thay đổi platform của cron function đã được thiết lập',
		// 			HttpStatus.CONFLICT
		// 		);
		// 	}
		// }

		const currentCronFunction = await this.CronFunctionModel.findOne({ where: { id } });

		if (!currentCronFunction) {
			throw new HttpException('Không tìm thấy cron function này.', HttpStatus.NOT_FOUND);
		}

		let checkOther = await this.CronFunctionModel.findOne({
			where: {
				id: { [Op.ne]: id },
				data_type_id: data.data_type_id,
				seller_id: currentCronFunction.seller_id,
				platform_id: currentCronFunction.platform_id
			}
		});

		if (checkOther) {
			throw new HttpException('Cron function đã tồn tại.', HttpStatus.CONFLICT);
		}

		await this.CronFunctionModel.update(data, { where: { id } });

		return parseDataSqlizeResponse(await this.CronFunctionModel.findOne({ where: { id } }));
	}

	async getCronFunctionList(
		seller_id,
		queryParams: CronFunctionQueryParamsDto
	): Promise<ResponseAbstractList<CronFunction>> {
		const { q, status, platform_id, data_type_id } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };
		let _whereClausePlatform: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					description: {
						[Op.like]: `%${q}%`
					}
				}
			};
			_whereClausePlatform = {
				..._whereClausePlatform,
				[Op.or]: {
					platform_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status: status === 'true'
			};
		}
		if (platform_id) {
			_whereClause = {
				..._whereClause,
				platform_id
			};
		}
		if (data_type_id) {
			_whereClause = {
				..._whereClause,
				data_type_id
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.CronFunctionModel.findAndCountAll({
				where: _whereClause,
				include: [{ model: Seller }, { model: Platform }, { model: DataTypes }],
				order: [['updated_at', 'DESC']],
				limit,
				offset
			})
		);

		for (const cronFunction of rows) {
			cronFunction['status'] = cronFunction['status'] == 1 ? true : false;
		}

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getCronFunctionById(id): Promise<CronFunction> {
		return this.CronFunctionModel.findOne({
			where: { id },
			include: [Seller, Platform, DataTypes]
		});
	}
}
