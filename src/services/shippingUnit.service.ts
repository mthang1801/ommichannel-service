import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Op } from 'sequelize';
import { defineShippingUnits } from 'src/common/constants/constant';
import { NTLPaymentMethodEnum, ShippingUnitIdsEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { shippingUnitConfig } from 'src/configs/configs';
import { CalcShippingFeeDto } from 'src/dtos/requests/shippingUnit/calcShippingFee.dto';
import { ConnectShippingUnitDto } from 'src/dtos/requests/shippingUnit/connectShippingUnit.dto';
import { ConnectToNTLDto } from 'src/dtos/requests/shippingUnit/connectToNTL.dto';
import { CreateBillShippingNTLDto } from 'src/dtos/requests/shippingUnit/createBillShipping.dto';
import { ShippingUnitQueryParamsDto } from 'src/dtos/requests/shippingUnit/shippingUnitQueryParams.dto';
import { UpdateServicePaymentDto } from 'src/dtos/requests/shippingUnit/updateServicePayment.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import {
	IShippingUnitData,
	IShippingUnitNTLCalcFee,
	IShippingUnitNTLData,
	IShippingUnitNTLOrderCreateResponse,
	IShippingUnitNTLResponse
} from 'src/interfaces/shippingUnitData.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CachingService } from 'src/microservices/caching/caching.service';
import { Order } from 'src/models/order.model';
import { SellerShippingPaymentMethod } from 'src/models/sellerShippingPaymentMethod.model';
import { SellerShippingService } from 'src/models/sellerShippingService.model';
import { SellerShippingUnit } from 'src/models/sellerShippingUnit.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import {
	filterData,
	getKeyByValue,
	getPageOffsetLimit,
	isJsonString,
	parseDataSqlizeResponse,
	returnListWithPaging
} from 'src/utils/functions.utils';
import { NTLShippingUnitServiceEnum } from '../common/constants/enum';
import { isSpecialAdminByRoleCode } from '../common/guards/auth';

@Injectable()
export class ShippingUnitService {
	private logger = new Logger(ShippingUnitService.name);
	constructor(
		@InjectModel(ShippingUnit)
		private readonly ShippingUnitModel: typeof ShippingUnit,
		@InjectModel(SellerShippingUnit)
		private readonly SellerShippingUnitModel: typeof SellerShippingUnit,
		@InjectModel(SellerShippingService) private readonly SellerShippingServicesModel: typeof SellerShippingService,
		@InjectModel(SellerShippingPaymentMethod)
		private readonly SellerShippingPaymentMethodModel: typeof SellerShippingPaymentMethod,
		private readonly cachingService: CachingService
	) {}

	async changeStatus(id: number): Promise<any> {
		const shippingUnit = parseDataSqlizeResponse(await this.ShippingUnitModel.findOne({ where: { id } }));
		if (!shippingUnit) {
			throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		}
		await this.ShippingUnitModel.update({ status: !shippingUnit.status }, { where: { id } });
		return parseDataSqlizeResponse(await this.ShippingUnitModel.findOne({ where: { id } }));
	}

	async connectToShippingUnit(shippingUnitId: number, user: IUserAuth, data: ConnectShippingUnitDto): Promise<void> {
		const { sellerId } = user;
		if (!isJsonString(data.data)) {
			throw new HttpException(messages.shippingUnit.isNotJson, HttpStatus.BAD_REQUEST);
		}
		await this.shippingUnitValidation(shippingUnitId);
		const payloadData = this.shippingUnitConnectDataValidation(shippingUnitId, data);
		const responseData: any = await this.connectToShippingUnitResponse(payloadData, shippingUnitId);
		const payloadSellerShippingData = {
			shipping_unit_id: shippingUnitId,
			seller_id: sellerId,
			data: JSON.stringify(responseData),
			code: `NTL-${responseData.partner_id}-${sellerId}`,
			connect_status: true,
			last_connected_at: formatMySQLTimeStamp()
		};
		await Promise.all([
			this.createSellerShippingUnit(payloadSellerShippingData),
			this.createSellerShippingService(sellerId, shippingUnitId, data.delivery_service_ids),
			this.createSellerPaymentMethod(sellerId, shippingUnitId, data.payment_method_ids)
		]);
	}

	async connectToNTLShippingUnit({ sellerId }: IUserAuth, data: ConnectToNTLDto): Promise<void> {
		const shippingUnitId = ShippingUnitIdsEnum.NTL;
		await this.shippingUnitValidation(shippingUnitId);
		const responseData: any = await this.connectToShippingUnitResponse(data, shippingUnitId);
		const payloadSellerShippingData = this.payloadSellerShippingDataByShippingUnit(
			shippingUnitId,
			sellerId,
			responseData
		);
		await Promise.all([
			this.createSellerShippingUnit(payloadSellerShippingData),
			this.createSellerShippingService(sellerId, shippingUnitId, data.delivery_service_ids),
			this.createSellerPaymentMethod(sellerId, shippingUnitId, data.payment_method_ids)
		]);
	}

	payloadSellerShippingDataByShippingUnit(shippingUnitId: number, sellerId: number, responseData: any) {
		const shippingUnitName = getKeyByValue(ShippingUnitIdsEnum, ShippingUnitIdsEnum.NTL);
		return {
			shipping_unit_id: shippingUnitId,
			seller_id: sellerId,
			data: JSON.stringify(responseData),
			code: `${shippingUnitName}-${responseData.partner_id}-${sellerId}`,
			connect_status: true,
			last_connected_at: formatMySQLTimeStamp()
		};
	}

	async connectToShippingUnitResponse(payloadData: IShippingUnitData, shippingUnitId: number) {
		switch (shippingUnitId) {
			case ShippingUnitIdsEnum.NTL:
				return await this.requestDataFromNTL(payloadData.username, payloadData.password);
		}
	}

	shippingUnitConnectDataValidation(shippingUnitId: number, data: ConnectShippingUnitDto): IShippingUnitData {
		const { keys } = defineShippingUnits[getKeyByValue(ShippingUnitIdsEnum, shippingUnitId)];
		const payloadData: IShippingUnitData = JSON.parse(data.data);
		const count = Object.keys(payloadData).reduce((_count, property) => {
			if (!keys.includes(property)) {
				throw new HttpException(messages.shippingUnit.notEnoughtProperty, HttpStatus.BAD_REQUEST);
			}
			return ++_count;
		}, 0);
		if (count < keys.length) {
			throw new HttpException(messages.shippingUnit.notEnoughtProperty, HttpStatus.BAD_REQUEST);
		}
		return payloadData;
	}

	async shippingUnitValidation(shippingUnitId: number, checkStatusTrue = true): Promise<ShippingUnit> {
		const currentShippingUnit = await this.ShippingUnitModel.findByPk(shippingUnitId);
		if (!currentShippingUnit) {
			throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		}
		if (!currentShippingUnit.status && checkStatusTrue) {
			throw new HttpException(messages.shippingUnit.inactive, HttpStatus.BAD_REQUEST);
		}
		return currentShippingUnit;
	}

	async createSellerShippingUnit(data) {
		await this.SellerShippingUnitModel.bulkCreate([data] as any[], {
			updateOnDuplicate: [...Object.keys(data)]
		});
	}

	async createSellerShippingService(
		sellerId: number,
		shippingUnitId: number,
		deliveryServiceIds: number[]
	): Promise<void> {
		switch (shippingUnitId) {
			case ShippingUnitIdsEnum.NTL:
				{
					await this.createSellerShippingServiceNTL(sellerId, deliveryServiceIds);
				}
				break;
		}
	}

	async createSellerPaymentMethod(
		sellerId: number,
		shippingUnitId: number,
		paymentMethodIds: number[]
	): Promise<void> {
		switch (shippingUnitId) {
			case ShippingUnitIdsEnum.NTL: {
				await this.createSellerShippingPaymentMethodNTL(sellerId, paymentMethodIds);
				return;
			}
		}
	}

	async createSellerShippingServiceNTL(sellerId: number, deliveryServiceIds: number[]) {
		if (deliveryServiceIds.length) {
			await this.SellerShippingServicesModel.destroy({
				where: { seller_id: sellerId, shipping_unit_id: ShippingUnitIdsEnum.NTL }
			});
			const payloads = Object.values(NTLShippingUnitServiceEnum)
				.filter(Number)
				.map((deliveryServiceId: number) => ({
					seller_id: sellerId,
					shipping_unit_id: ShippingUnitIdsEnum.NTL,
					delivery_service_id: deliveryServiceId,
					delivery_service_name: getKeyByValue(NTLShippingUnitServiceEnum, deliveryServiceId),
					status: deliveryServiceIds.includes(deliveryServiceId)
				}));
			await this.SellerShippingServicesModel.bulkCreate(payloads);
		}
	}

	async createSellerShippingPaymentMethodNTL(sellerId: number, paymentMethodIds: number[]) {
		if (paymentMethodIds.length) {
			await this.SellerShippingPaymentMethodModel.destroy({
				where: { seller_id: sellerId, shipping_unit_id: ShippingUnitIdsEnum.NTL }
			});
			const payloads = Object.values(NTLPaymentMethodEnum)
				.filter(Number)
				.map((paymentMethodId: number) => ({
					seller_id: sellerId,
					shipping_unit_id: ShippingUnitIdsEnum.NTL,
					payment_method_id: paymentMethodId,
					payment_method_name: getKeyByValue(NTLPaymentMethodEnum, paymentMethodId),
					status: paymentMethodIds.includes(paymentMethodId)
				}));
			await this.SellerShippingPaymentMethodModel.bulkCreate(payloads);
		}
	}

	async disconnectToShippingUnit({ sellerId }: IUserAuth, id: number): Promise<void> {
		const currentSellerShipping = await this.SellerShippingUnitModel.findOne({
			where: { shipping_unit_id: id, seller_id: sellerId },
			logging: true
		});

		if (!currentSellerShipping) {
			throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		}
		await this.SellerShippingUnitModel.update(
			{ data: '', code: '', connect_status: false },
			{ where: { shipping_unit_id: id, seller_id: sellerId } }
		);
	}

	async updateServicePayment({ sellerId }: IUserAuth, shippingUnitId, data: UpdateServicePaymentDto): Promise<void> {
		await Promise.all([
			this.createSellerShippingService(sellerId, shippingUnitId, data.delivery_service_ids),
			this.createSellerPaymentMethod(sellerId, shippingUnitId, data.payment_method_ids)
		]);
	}

	async requestDataFromNTL(username: string, password: string): Promise</*IShippingUnitNTLResponse */ any> {
		const payloadData: IShippingUnitNTLData = {
			username,
			password,
			partner_id: shippingUnitConfig.NTL.partner_id
		};
		try {
			const headers = {
				username: shippingUnitConfig.NTL.username,
				password: shippingUnitConfig.NTL.password
			};
			const response = await axios({
				url: defineShippingUnits.NTL.api.signIn,
				headers,
				method: 'POST',
				data: payloadData
			});

			return {
				username,
				password,
				partner_id: shippingUnitConfig.NTL.partner_id,
				...response.data.data.partner_info
			};
		} catch (error) {
			throw new HttpException(error.response.data.message, error.response.status);
		}
	}

	async getShippingUnitList(
		{ sellerId, roleCode }: IUserAuth,
		queryParams: ShippingUnitQueryParamsDto
	): Promise<ResponseAbstractList<any>> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const { q, status } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					shipping_unit: {
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

		const { rows, count } = parseDataSqlizeResponse(
			await this.ShippingUnitModel.findAndCountAll({
				attributes: { exclude: ['status'] },
				where: _whereClause,
				limit,
				offset
			})
		);

		for (const item of rows) {
			const sellerShippingUnit = await this.SellerShippingUnitModel.findOne({
				where: { seller_id: sellerId, shipping_unit_id: item.id }
			});

			if (sellerShippingUnit) {
				item['connect_status'] = sellerShippingUnit.connect_status;
			} else {
				item['connect_status'] = false;
			}
		}

		return returnListWithPaging(page, limit, count, rows);
	}

	async getShippingUnitListSuperAdmin(
		{ sellerId, roleCode }: IUserAuth,
		queryParams: ShippingUnitQueryParamsDto
	): Promise<ResponseAbstractList<ShippingUnit>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const { q, status } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					shipping_unit: {
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

		const { rows, count } = parseDataSqlizeResponse(
			await this.ShippingUnitModel.findAndCountAll({
				where: _whereClause,
				limit,
				offset
			})
		);
		return returnListWithPaging(page, limit, count, rows);
	}

	async getByShippingUnitId({ sellerId }: IUserAuth, shippingUnitId: number): Promise<SellerShippingUnit | any> {
		const sellerShipping = await this.SellerShippingUnitModel.findOne({
			where: { seller_id: sellerId, shipping_unit_id: shippingUnitId },
			include: [SellerShippingService, SellerShippingPaymentMethod]
		});

		if (!sellerShipping) throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		const result = sellerShipping.toJSON();
		if (isJsonString(result.data)) {
			const data: any = JSON.parse(result.data);
			result.data = data;
		}

		return result;
	}

	async calcShippingFee(sellerId: number, data: CalcShippingFeeDto): Promise<any> {
		switch (data.shipping_unit_id) {
			case ShippingUnitIdsEnum.NTL:
				return await this.calcShippingFeeNTL(sellerId, data);
			default: {
				throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
			}
		}
	}

	async getShippingDataBySellerId(
		sellerId: number,
		shippingUnit: ShippingUnitIdsEnum
	): Promise<IShippingUnitNTLResponse> {
		switch (shippingUnit) {
			case ShippingUnitIdsEnum.NTL: {
				const sellerShipping = await this.checkShippingSellerExist(sellerId, ShippingUnitIdsEnum.NTL);
				const sellerShippingData: IShippingUnitNTLResponse = JSON.parse(sellerShipping.data);
				return sellerShippingData;
			}
		}
	}

	async calcShippingFeeNTL(sellerId: number, data: CalcShippingFeeDto): Promise<any> {
		// Mock data
		const sellerShippingData: IShippingUnitNTLResponse = await this.getShippingDataBySellerId(
			/*sellerId */ 5,
			ShippingUnitIdsEnum.NTL
		);
		const payloadData = this.getShippingFeeDataNTL(data);
		const config: any = {
			method: 'post',
			url: defineShippingUnits.NTL.api.calcFee,
			headers: {
				username: sellerShippingData.username,
				password: sellerShippingData.password,
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(payloadData)
		};

		try {
			const response = await axios(config);
			return response.data.data;
		} catch (error) {
			console.log(error);
			console.log(error.response);
			throw new HttpException(error.response.data.message, 400);
		}
	}

	getShippingFeeDataNTL(data: CalcShippingFeeDto) {
		const payloadData: IShippingUnitNTLCalcFee = {
			weight: data.weight,
			payment_method_id: data.payment_method_id,
			s_province: data.s_province,
			s_district: data.s_district,
			r_province: data.r_province,
			r_district: data.r_district,
			cod_amount: data.cod_amount,
			service_id: data.service_id
		};

		return filterData(payloadData) as IShippingUnitNTLCalcFee;
	}

	async createBillShippingNTL(sellerId: number, order: Order): Promise<IShippingUnitNTLOrderCreateResponse> {
		const sellerShipping = await this.checkShippingSellerExist(sellerId, ShippingUnitIdsEnum.NTL);

		if (!sellerShipping) {
			throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		}

		const sellerShippingData: IShippingUnitNTLResponse = JSON.parse(sellerShipping.data);

		const payloadData = CreateBillShippingNTLDto.getBillShippingPayloadData(sellerShippingData.partner_id, order);

		const config: any = {
			method: 'post',
			url: defineShippingUnits.NTL.api.createBillShipping,
			headers: {
				username: shippingUnitConfig.NTL.username || sellerShippingData.username,
				password: shippingUnitConfig.NTL.password || sellerShippingData.password,
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(payloadData)
		};

		try {
			const response = await axios(config);
			this.logger.log('createBillShippingNTL', JSON.stringify(config));
			return response.data.data;
		} catch (error) {
			console.log(error);
			console.log(error.response.config.headers);
			throw new HttpException(error.response.data.message, error.status);
		}
	}

	async checkShippingSellerExist(sellerId: number, shippingUnitId: number): Promise<SellerShippingUnit> {
		const sellerShipping = await this.SellerShippingUnitModel.findOne({
			where: {
				seller_id: sellerId,
				shipping_unit_id: shippingUnitId
			}
		});

		if (!sellerShipping) {
			throw new HttpException(messages.shippingUnit.notFound, HttpStatus.NOT_FOUND);
		}

		return sellerShipping;
	}
}
