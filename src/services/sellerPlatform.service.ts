import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse, getPageOffsetLimit } from 'src/utils/functions.utils';
import { SellerPlatform } from 'src/models/sellerPlatform.model';
import { SellerPlatformQueryParamsDto } from 'src/dtos/requests/sellerPlatform/sellerPlatformQueryParams.dto';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';
import { CreateSellerPlatformDto } from 'src/dtos/requests/sellerPlatform/createSellerPlatform.dto';
import { SellerPlatformPayloadDto } from 'src/dtos/sellerPlatformPayload.dto';
import { CronFunction } from 'src/models/cronFunction.model';
import { DataTypes } from 'src/models/dataType.model';
import { CronFunctionScheduler } from 'src/models/cronFunctionScheduler.model';
import { CreateCronFunctionSchedulerDto } from 'src/dtos/requests/cronFunction/createCronFunctionScheduler.dto';
import { UpdateCronFunctionSchedulerDto } from 'src/dtos/requests/cronFunction/updateCronFunctionScheduler.dto';
import { Scheduler } from 'src/models/scheduler.model';
import { CronFunctionSchedulerPayloadDto } from 'src/dtos/cronFunctionScheduler.dto';
import { filterData } from 'src/utils/functions.utils';

@Injectable()
export class SellerPlatformService {
	constructor(
		@InjectModel(SellerPlatform)
		private readonly SellerPlatformModel: typeof SellerPlatform,
		@InjectModel(CronFunction)
		private readonly CronFunctionModel: typeof CronFunction,
		@InjectModel(CronFunctionScheduler)
		private readonly CronFunctionSchedulerModel: typeof CronFunctionScheduler,
		@InjectModel(Seller)
		private readonly SellerModel: typeof Seller
	) {}

	async createSellerPlatform(data: CreateSellerPlatformDto, sellerId: number): Promise<void | SellerPlatform> {
		const sellerPlatform = await this.SellerPlatformModel.findOne({
			where: { seller_id: sellerId, platform_id: data.platform_id }
		});
		if (sellerPlatform) {
			throw new HttpException('Đã kết nối đến sàn này.', 400);
		}

		const payload: SellerPlatformPayloadDto = {
			...data,
			seller_id: sellerId
		};
		return this.SellerPlatformModel.create(payload as any);
	}

	async updateStatus(id: number, seller_id, payload: SellerPlatformPayloadDto): Promise<any> {
		const newData = {
			...payload
		};

		if (payload.locked === true) {
			const seller = await this.SellerModel.findOne({
				where: { id: seller_id }
			});
			newData['locked_by'] = seller.seller_name;
		} else if (payload.locked === false) {
			newData['locked_by'] = null;
		}
		await this.SellerPlatformModel.update(newData, {
			where: { id, seller_id }
		});

		return parseDataSqlizeResponse(await this.SellerPlatformModel.findOne({ where: { id } }));
	}

	async getSellerPlatformList(
		seller_id,
		queryParams: SellerPlatformQueryParamsDto
	): Promise<ResponseAbstractList<SellerPlatform>> {
		const { platform_id, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

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

		const { rows, count } = parseDataSqlizeResponse(
			await this.SellerPlatformModel.findAndCountAll({
				attributes: { exclude: ['locked', 'locked_by'] },
				where: _whereClause,
				include: [Platform],
				limit,
				offset,
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

	async getSellerPlatformListSuperAdmin(
		queryParams: SellerPlatformQueryParamsDto
	): Promise<ResponseAbstractList<SellerPlatform>> {
		const { platform_id, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = {};

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

		const { rows, count } = parseDataSqlizeResponse(
			await this.SellerPlatformModel.findAndCountAll({
				where: _whereClause,
				include: [Seller, Platform],
				limit,
				offset,
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

	// async getSupplierById(id): Promise<Supplier> {
	// 	return this.SupplierModel.findOne({
	// 		where: { id },
	// 		include: [
	// 			{ model: Bank },
	// 			{ model: Province },
	// 			{ model: District },
	// 			{ model: Ward }
	// 		]
	// 	});
	// }

	async getSellerPlatformByPlatformId(seller_id, platform_id) {
		const _whereClause: any = { seller_id, platform_id };

		const sellerPlatform = parseDataSqlizeResponse(
			await this.SellerPlatformModel.findOne({
				where: _whereClause,
				include: [{ model: Seller }, { model: Platform }]
			})
		);

		const cronFunctions = parseDataSqlizeResponse(
			await this.CronFunctionModel.findAll({
				where: _whereClause,
				include: [DataTypes]
			})
		);

		const cronFunctionSchedulers = parseDataSqlizeResponse(
			await this.CronFunctionSchedulerModel.findAll({
				where: _whereClause,
				include: [{ model: CronFunction, include: [DataTypes] }, Scheduler]
			})
		);

		return {
			...sellerPlatform,
			cron_functions: cronFunctions,
			cron_function_schedulers: cronFunctionSchedulers
		};
	}

	async createCronFunctionScheduler(
		data: CreateCronFunctionSchedulerDto,
		sellerId: number
	): Promise<void | CronFunctionScheduler> {
		const cronFunctionScheduler = await this.CronFunctionSchedulerModel.findOne({
			where: {
				seller_id: sellerId,
				cron_function_id: data.cron_function_id
			}
		});
		if (cronFunctionScheduler) {
			throw new HttpException('Đã tồn tại.', 400);
		}

		const cronFunction = parseDataSqlizeResponse(
			await this.CronFunctionModel.findOne({
				where: { id: data.cron_function_id }
			})
		);

		const payload = {
			...data,
			seller_id: sellerId,
			platform_id: cronFunction.platform_id
		};
		return this.CronFunctionSchedulerModel.create(payload as any);
	}

	async updateCronFunctionScheduler(id: number, data: CronFunctionSchedulerPayloadDto): Promise<any> {
		await this.CronFunctionSchedulerModel.update(data, {
			where: { id }
		});

		return parseDataSqlizeResponse(await this.CronFunctionSchedulerModel.findOne({ where: { id } }));
	}
}
