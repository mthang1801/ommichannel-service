import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { InjectModel } from '@nestjs/sequelize';
import messages from 'src/common/constants/messages';
import { CreateCustomerPointConfigDto } from 'src/dtos/requests/customerPointConfig/createCustomerPointConfig.dto';
import { UpdateCustomerPointConfigDto } from 'src/dtos/requests/customerPointConfig/updateCustomerPointConfig.dto';
import { IAutoUsePoint } from 'src/interfaces/pointConfig.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CachingService } from 'src/microservices/caching/caching.service';
import { Customer } from 'src/models/customer.model';
import { CustomerPointConfig } from 'src/models/customerPointConfig.model';
import { User } from 'src/models/user.model';
import { CustomerService } from './customer.service';

@Injectable()
export class CustomerPointConfigService {
	constructor(
		@InjectModel(CustomerPointConfig) private readonly CustomerPointConfigModel: typeof CustomerPointConfig,
		@InjectModel(User) private readonly UserModel: typeof User,
		private readonly cachingService: CachingService,
		@Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService
	) {}

	async createCustomerPointConfig(data: CreateCustomerPointConfigDto, user: IUserAuth): Promise<any> {
		const { sellerId, userId } = user;

		const userInfo = await this.UserModel.findOne({
			where: { id: userId }
		});

		const customerPointConfigData = {
			...data,
			seller_id: sellerId,
			created_by: userInfo.fullname
		};

		return this.CustomerPointConfigModel.create(customerPointConfigData as any, { logging: true });
	}

	async updateCustomerPointConfig(data: UpdateCustomerPointConfigDto, user: IUserAuth): Promise<any> {
		const { sellerId, userId } = user;

		const checkCustomerPoint = await this.CustomerPointConfigModel.findOne({ where: { seller_id: sellerId } });

		if (!checkCustomerPoint) {
			return this.createCustomerPointConfig(data, user);
		}

		const userInfo = await this.UserModel.findOne({
			where: { id: userId }
		});

		const customerPointConfigData = {
			...data,
			updated_by: userInfo.fullname
		};
		console.log(customerPointConfigData);

		await this.CustomerPointConfigModel.update(customerPointConfigData, { where: { seller_id: sellerId } });
	}

	async getCustomerPointConfig(sellerId: number): Promise<CustomerPointConfig> {
		return this.CustomerPointConfigModel.findOne({
			where: { seller_id: sellerId }
		});
	}

	async getCustomerPointInfo(sellerId: number, customerId: number, usedPoint: number) {
		const pointConfig = await this.getCustomerPointConfig(sellerId);
		if (!pointConfig) throw new HttpException(messages.pointConfig.sellerHasNotSetup, HttpStatus.BAD_REQUEST);
		this.checkPointConfigStatusValidation(pointConfig);
		this.checkPointConfigTimestampValidation(pointConfig);
		const customerInfo = await this.customerService.getCustomerById(sellerId, customerId);
		this.checkUsedPointValidation(pointConfig, customerInfo.total_point, usedPoint);
		return {
			...pointConfig,
			...customerInfo
		};
	}

	checkPointConfigTimestampValidation(poinConfig: CustomerPointConfig) {
		const currentTimestamp = Date.now();
		const startAtTimestamp = poinConfig.start_at ? new Date(poinConfig.start_at).getTime() : null;
		const endAtTimestamp = poinConfig.end_at ? new Date(poinConfig.end_at).getTime() : null;

		if (startAtTimestamp) {
			if (startAtTimestamp > currentTimestamp)
				throw new HttpException(messages.pointConfig.startAtNotComeTo, HttpStatus.BAD_REQUEST);
		}

		if (endAtTimestamp) {
			if (endAtTimestamp < currentTimestamp)
				throw new HttpException(messages.pointConfig.endAtOverCome, HttpStatus.BAD_REQUEST);
		}
	}
	checkPointConfigStatusValidation(pointConfig: CustomerPointConfig) {
		if (!pointConfig.status) throw new HttpException(messages.pointConfig.statusFalse, HttpStatus.BAD_REQUEST);
	}

	checkUsedPointValidation(pointConfig: CustomerPointConfig, customerTotalPoint: number, usedPoint?: number) {
		if (pointConfig.min_point && pointConfig.min_point > usedPoint)
			throw new HttpException(messages.pointConfig.minPointGreaterThanUsedPoint, HttpStatus.BAD_REQUEST);
		if (pointConfig.max_point && pointConfig.max_point < usedPoint)
			throw new HttpException(messages.pointConfig.minPointGreaterThanUsedPoint, HttpStatus.BAD_REQUEST);
		this.checkCustomerMinPointValidation(pointConfig.min_point, customerTotalPoint, usedPoint);
	}

	checkCustomerMinPointValidation(customerConfigMinPoint: number, customerTotalPoint: number, usedPoint?: number) {
		if (usedPoint && customerTotalPoint < usedPoint)
			throw new HttpException(messages.pointConfig.customerPointNotEnough, HttpStatus.BAD_REQUEST);
		if (customerTotalPoint < customerConfigMinPoint)
			throw new HttpException(messages.pointConfig.customerPointNotEnough, HttpStatus.BAD_REQUEST);
	}

	async autoUsedPoint(sellerId: number, customerId: number): Promise<IAutoUsePoint> {
		const pointConfig = await this.getCustomerPointConfig(sellerId);
		if (!pointConfig) return this.returnUsedPoint(0, 0);
		const customerInfo = await this.customerService.getCustomerById(sellerId, customerId);
		return await this.getCustomerAutoUsePoint(pointConfig, customerInfo);
	}

	getCustomerAutoUsePoint(pointConfig: CustomerPointConfig, customer: Customer) {
		try {
			this.checkPointConfigStatusValidation(pointConfig);
			this.checkPointConfigTimestampValidation(pointConfig);
			this.checkCustomerMinPointValidation(pointConfig.min_point, customer.total_point);
			const maxUsedPoint = Math.min(pointConfig.max_point, Math.max(pointConfig.max_point, customer.total_point));
			const maxUsedPointValue = (maxUsedPoint * pointConfig.accumulated_money) / pointConfig.accumulated_point;
			return this.returnUsedPoint(maxUsedPoint, maxUsedPointValue);
		} catch (error) {
			console.log(error.stack);
			return this.returnUsedPoint(0, 0);
		}
	}

	returnUsedPoint(point: number, pointValue: number) {
		return { point, pointValue };
	}
}
