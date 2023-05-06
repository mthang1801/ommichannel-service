import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Op, Transaction } from 'sequelize';
import { OrderStatusEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { CreateCustomerPayload, CustomerPayloadDto, UpdateCustomerPayload } from 'src/dtos/customerPayload.dto';
import { CreateCustomerDto } from 'src/dtos/requests/customer/createCustomer.dto';
import { CustomerQueryParamsDto } from 'src/dtos/requests/customer/customerQueryParams.dto';
import { DecrementCustomerPointDto } from 'src/dtos/requests/customer/decrementCustomerPoint.dto copy';
import { IncrementCustomerPointDto } from 'src/dtos/requests/customer/incrementCustomerPoint.dto';
import { ReIncrementCustomerPointDto } from 'src/dtos/requests/customer/reIncrementCustomerPoint.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IAutoUsePoint } from 'src/interfaces/pointConfig.interface';
import { Customer } from 'src/models/customer.model';
import { CustomerAddress } from 'src/models/customerAddress.model';
import { CustomerPointHistory } from 'src/models/customerPointHistory.model';
import { filterData, getPageOffsetLimit, parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { IUserAuth } from '../interfaces/userAuth.interface';
import { CustomerPointConfigService } from './customerPointConfig.service';

@Injectable()
export class CustomerService {
	constructor(
		@InjectModel(Customer) private readonly CustomerModel: typeof Customer,
		@InjectModel(CustomerAddress)
		private readonly CustomerAddressModel: typeof CustomerAddress,
		private readonly customerPointConfigService: CustomerPointConfigService,
		@InjectModel(CustomerPointHistory) private readonly CustomerPointHistoryModel: typeof CustomerPointHistory
	) {}

	async customerValidation(sellerId: number, data: CustomerPayloadDto, id: number = null) {
		let _whereClause: any = {
			seller_id: sellerId
		};

		let conditionClause: any = null;
		if (data.phone && data.email) {
			if (id) {
				conditionClause = {
					[Op.or]: [
						{
							phone: data.phone,
							id: { [Op.ne]: id }
						},
						{
							email: data.email,
							id: { [Op.ne]: id }
						}
					]
				};
			} else {
				conditionClause = {
					[Op.or]: [
						{
							phone: data.phone
						},
						{
							email: data.email
						}
					]
				};
			}
		} else if (data.phone) {
			if (id) {
				conditionClause = {
					[Op.and]: [{ phone: data.phone }, { id: { [Op.ne]: id } }]
				};
			} else {
				conditionClause = { phone: data.phone };
			}
		} else if (data.email) {
			if (id) {
				conditionClause = {
					[Op.and]: [{ email: data.email }, { id: { [Op.ne]: id } }]
				};
			} else {
				conditionClause = { email: data.email };
			}
		}

		if (conditionClause) {
			_whereClause = {
				seller_id: sellerId,
				...conditionClause
			};
		} else {
			return;
		}

		const customerExist = await this.CustomerModel.findOne({
			where: _whereClause
		});

		if (customerExist) {
			throw new HttpException(messages.customers.hasExistPhoneOrEmail, HttpStatus.CONFLICT);
		}
	}

	async creatCustomer(
		data: CreateCustomerDto,
		sellerId: number,
		transaction: Transaction
	): Promise<CreateCustomerDto> {
		const payload: CreateCustomerPayload = {
			...data,
			seller_id: sellerId
		};

		await this.customerValidation(sellerId, payload);

		let options: any = { transaction };
		if (payload.shipping_info.length) {
			options = {
				include: [CustomerAddress]
			};
		}
		const newCustomer = await this.CustomerModel.create(payload as any, options);

		const customerCode = `KH${newCustomer['id']}SE${sellerId}`;
		await this.CustomerModel.update(
			{ customer_code: customerCode },
			{ where: { id: newCustomer['id'] }, transaction }
		);

		return data;
	}

	async updateCustomer(id: number, sellerId: number, payloadData: UpdateCustomerPayload): Promise<void> {
		const payload = filterData<UpdateCustomerPayload>(payloadData);
		await this.customerValidation(sellerId, payload, id);
		await this.CustomerModel.update(payload, { where: { id } });

		const _removedCustomerShipping = payload?.removed_shipping_info?.length
			? this.CustomerAddressModel.destroy({
					where: { id: payload.removed_shipping_info }
			  })
			: null;

		let _createCustomerShipping = null;
		if (payload?.new_shipping_info?.length) {
			const createCustomerShippingPayloads = payload.new_shipping_info.map((item) => ({
				...item,
				customer_id: id
			}));
			_createCustomerShipping = this.CustomerAddressModel.bulkCreate(createCustomerShippingPayloads);
		}

		let _updateCustomerShipping = [];
		if (payload?.updated_shipping_info?.length) {
			_updateCustomerShipping = payload.updated_shipping_info.map(async (shippingInfoItem) =>
				this.CustomerAddressModel.update(shippingInfoItem, {
					where: { id: shippingInfoItem.id }
				})
			);
		}

		await Promise.all([_removedCustomerShipping, _createCustomerShipping, ..._updateCustomerShipping]);
	}

	async getCustomersList(
		sellerId: number,
		queryParams: CustomerQueryParamsDto
	): Promise<ResponseAbstractList<Customer>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		const whereClause = CustomerQueryParamsDto.getCustomerQueryParamsClause(sellerId, queryParams);

		const { rows, count } = await this.CustomerModel.findAndCountAll({
			where: whereClause,
			order: [['createdAt', 'DESC']],
			limit,
			offset
		});

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: parseDataSqlizeResponse(rows)
		};
	}

	async getCustomerById(sellerId: number, customerId: number): Promise<Customer> {
		const result = await this.CustomerModel.findOne({
			attributes: {
				include: [
					[
						sequelize.literal(`(
							SELECT COUNT(*)
							FROM orders AS tempOrders
							WHERE
							tempOrders.customer_id = Customer.id
							AND tempOrders.order_status_id = ${OrderStatusEnum['Hoàn thành']}								
						)`),
						'total_orders_purchased_amount'
					],
					[
						sequelize.literal(`(
							SELECT MAX(updated_at)
							FROM orders AS tempOrders
							WHERE
							tempOrders.customer_id = Customer.id
							AND tempOrders.order_status_id = ${OrderStatusEnum['Hoàn thành']}								
						)`),
						'last_purchased_amount'
					],
					[
						sequelize.literal(`(
							SELECT SUM(final_total_money_amount)
							FROM orders AS tempOrders
							WHERE
							tempOrders.customer_id = Customer.id
							AND tempOrders.order_status_id = ${OrderStatusEnum['Hoàn thành']}								
						)`),
						'total_money_purchased_amount'
					]
				]
			},
			where: { id: customerId, seller_id: sellerId },
			include: [
				{
					model: CustomerAddress,
					order: [['created_at', 'DESC']]
				}
			]
		});

		if (!result) {
			throw new HttpException(messages.customers.notFound, HttpStatus.NOT_FOUND);
		}

		return result;
	}

	async incrementCustomerPoint(data: IncrementCustomerPointDto): Promise<void> {
		const getCustomerPointConfig = await this.customerPointConfigService.getCustomerPointConfig(data.seller_id);

		if (
			!getCustomerPointConfig ||
			!getCustomerPointConfig.accumulated_money ||
			!getCustomerPointConfig.accumulated_point
		)
			return;
		const pointValue = getCustomerPointConfig.point_round_to_down
			? Math.floor(
					(data.goods_total_price * getCustomerPointConfig.accumulated_point) /
						getCustomerPointConfig.accumulated_money
			  )
			: Math.ceil(
					(data.goods_total_price * getCustomerPointConfig.accumulated_point) /
						getCustomerPointConfig.accumulated_money
			  );

		const customerHistoryPointPayload = {
			...data,
			point_value: pointValue
		};

		await Promise.all([
			this.CustomerModel.increment({ total_point: pointValue }, { where: { id: data.customer_id } }),
			this.CustomerPointHistoryModel.create(customerHistoryPointPayload as any)
		]);
	}

	async decrementCustomerPoint(data: DecrementCustomerPointDto): Promise<void> {
		await Promise.all([
			this.CustomerModel.decrement({ total_point: Math.abs(data.point_value) }, { where: { id: data.customer_id } }),
			this.CustomerPointHistoryModel.create(data as any)
		]);
	}
	
	async reIncrementCustomerPoint(data: ReIncrementCustomerPointDto): Promise<void> {
		await Promise.all([
			this.CustomerModel.increment({ total_point: Math.abs(data.point_value) }, { where: { id: data.customer_id } }),
			this.CustomerPointHistoryModel.create(data as any)
		]);
	}

	async autoUsedPoint({ sellerId }: IUserAuth, customerId: number): Promise<IAutoUsePoint> {
		return await this.customerPointConfigService.autoUsedPoint(sellerId, customerId);
	}
}
