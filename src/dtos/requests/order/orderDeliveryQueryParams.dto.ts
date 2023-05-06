import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { filterQueryParams } from 'src/utils/functions.utils';
import { OrderStatusEnum } from '../../../common/constants/enum';

export class OrderDeliveryQueryParamsDto {
	@ApiPropertyOptional()
	@IsOptional()
	delivery_code: string;

	@ApiPropertyOptional({ description: 'Số điện thoại KH' })
	@IsOptional()
	q: number;

	@ApiPropertyOptional()
	@IsOptional()
	order_status_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => `${value} 00:00:00`)
	created_at_start: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => `${value} 23:59:59`)
	created_at_end: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value) || undefined)
	shipping_unit_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	empty_cod_and_carriage_id: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	page: number;

	@ApiPropertyOptional()
	@IsOptional()
	limit: number;

	static getWhereClauseQueryParams(
		sellerId: number,
		queryParams: OrderDeliveryQueryParamsDto,
		isSpecialAdmin: boolean
	) {
		const filteredQueryParams = filterQueryParams({
			...queryParams,
			seller_id: sellerId
		});

		return Object.entries(filteredQueryParams).reduce(
			(whereClause: any, [_, [key, val]]: any) => {
				if ([undefined, null].includes(val)) {
					return whereClause;
				}

				switch (key) {
					case 'delivery_code':
						{
							whereClause['delivery_code'] = {
								[Op.like]: `%${val}%`
							};
						}
						break;
					case 'empty_cod_and_carriage_id':
						{
							if (val) {
								whereClause['cod_and_carriage_bill_id'] = null;
								whereClause['order_status_id'] = {
									[Op.in]: [OrderStatusEnum['Giao thành công'], OrderStatusEnum['Đã chuyển hoàn']]
								};
							}
						}
						break;
					case 'created_at_start':
					case 'created_at_end':
						{
							whereClause['created_at'] = {
								[Op.between]: [queryParams.created_at_start, queryParams.created_at_end]
							};
						}
						break;
					case 'q':
						{
							whereClause = {
								...whereClause,
								[Op.or]: [
									{
										s_fullname: {
											[Op.like]: `%${val}%`
										}
									},
									{
										s_phone: {
											[Op.like]: `${val}%`
										}
									},
									{
										delivery_code: {
											[Op.like]: `%${val}%`
										}
									},
									{
										order_code: {
											[Op.like]: `%${val}%`
										}
									}
								]
							};
						}
						break;
					default: {
						whereClause[key] = val;
					}
				}
				return whereClause;
			},
			!filteredQueryParams.order_status_id
				? {
						order_status_id: {
							[Op.in]: [
								OrderStatusEnum['Chờ lấy hàng'],
								OrderStatusEnum['Đang vận chuyển'],
								OrderStatusEnum['Đang giao hàng'],
								OrderStatusEnum['Giao thành công'],
								OrderStatusEnum['Lỗi giao hàng'],
								OrderStatusEnum['Chờ giao lại'],
								OrderStatusEnum['Đang chuyển hoàn'],
								OrderStatusEnum['Đã chuyển hoàn']
							]
						}
				  }
				: {}
		);
	}
}
