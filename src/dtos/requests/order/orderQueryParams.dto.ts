import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { filterSeperator } from 'src/common/constants/constant';
import { OrderStatusEnum, PaymentStatusEnum } from 'src/common/constants/enum';
import { filterValueORRegExpString, isEmptyObject } from 'src/utils/functions.utils';

export class OrderQueryParamsDto {
	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	q?: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	order_status_id?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	platform_id?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	payment_status?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	payment_method_id?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	customer_id?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@Transform(({ value }) => (value ? value.split(',').map(Number) : value))
	category_ids?: number[];

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	from_date?: Date;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	to_date?: Date;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	page?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	limit?: number;

	static getOrdersListQueryParams(sellerId: number, queryParams: OrderQueryParamsDto) {
		const { q, order_status_id, platform_id, payment_status, payment_method_id, customer_id, from_date, to_date } =
			queryParams;
		return [
			{ seller_id: sellerId },
			{ q },
			{ customer_id },
			{ order_status_id },
			{ platform_id },
			{ payment_method_id },
			{ payment_status },
			{ from_date, to_date }
		]
			.filter((item) => {
				return !isEmptyObject(item);
			})
			.reduce((newWhereClause: any, ele): any => {
				Object.entries(ele).map(([key, val]) => {
					switch (key) {
						case 'q':
							newWhereClause = {
								...newWhereClause,
								[Op.or]: {
									order_code: {
										[Op.like]: `%${val}%`
									},
									b_fullname: {
										[Op.like]: `%${val}%`
									},
									b_phone: {
										[Op.like]: `${val}%`
									},
									b_email: {
										[Op.like]: `%${val}%`
									}
								}
							};
							break;
						case 'from_date':
						case 'to_date':
							{
								newWhereClause.created_at = {
									[Op.between]: [from_date + ' 00:00:00', to_date + ' 23:59:59']
								};
							}
							break;
						case 'order_status_id':
							{
								if (Number(val) === OrderStatusEnum['Đã xác nhận']) {
									newWhereClause.payment_status = {
										[Op.ne]: PaymentStatusEnum['Đã thanh toán']
									};
								}
								newWhereClause[key] = val;
							}
							break;

						case 'payment_method_id':
							{
								newWhereClause[key] = {
									[Op.regexp]: filterValueORRegExpString(String(val))
								};
							}
							break;
						default: {
							newWhereClause[key] = val;
						}
					}
				});

				return newWhereClause;
			}, {});
	}

	static getReportOrderStatusesQueryParams(seller_id: number, queryParams: OrderQueryParamsDto) {
		const { q, order_status_id, platform_id, payment_status, payment_method_id, customer_id, from_date, to_date } =
			queryParams;
		let result = [
			{ seller_id },
			{ q },
			{ customer_id },
			// { order_status_id },
			{ platform_id },
			{ payment_method_id },
			{ payment_status }
		]
			.filter((item) => !isEmptyObject(item))
			.map((item) =>
				Object.entries(item)
					.map(([key, val]) => {
						switch (key) {
							case 'q': {
								return [
									`( order_code LIKE '%${val}%'`,
									`b_fullname LIKE '%${val}$%'`,
									`b_phone LIKE '${val}%'`,
									`b_email LIKE '%${val}%' )`
								].join(' OR ');
							}
							case 'payment_method_id': {
								return `${key} = '${filterSeperator}${val}${filterSeperator}'`;
							}
							case 'payment_status': {
								if (
									Number(order_status_id) === OrderStatusEnum['Đã xác nhận'] &&
									Number(payment_status) === Number(PaymentStatusEnum['Đã thanh toán'])
								)
									return null;
								return `${key} = '${val}'`;
							}
							default:
								return `${key} = '${val}'`;
						}
					})
					.filter(Boolean)
					.join(' AND ')
			)
			.filter(Boolean)
			.join(' AND ');

		if (from_date && to_date) {
			result += ` AND created_at BETWEEN '${from_date} 00:00:00' AND '${to_date} 23:59:59' `;
		}
		return result;
	}
}
