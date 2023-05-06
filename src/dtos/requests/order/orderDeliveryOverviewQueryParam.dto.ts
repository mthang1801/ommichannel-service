import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { filterQueryParams } from 'src/utils/functions.utils';

export class OrderDeliveryOverviewQueryParamDto {
	@ApiPropertyOptional({ description: 'trạng thái' })
	@IsOptional()
	order_status_id: number;

	@ApiPropertyOptional({description : "Đơn vị vận chuyển"})
	@IsOptional()
	shipping_unit_id : number;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@IsOptional()
	from_date: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@IsOptional()
	to_date: string;

	static getOrderDeliveryOverviewQueryParam(
		sellerId: number,
		queryParams: OrderDeliveryOverviewQueryParamDto,
		isSpecialAdmin: boolean
	) {
		const filteredQueryParams = filterQueryParams({
			...queryParams,
			seller_id: sellerId
		});

		return Object.entries(filteredQueryParams)
			.map(([_, [key, val]]: any) => {
				if (key === 'from_date') {
					return `created_at BETWEEN '${queryParams.from_date} 00:00:00' AND '${queryParams.to_date} 23:59:59'`;
				}

				if (['to_date'].includes(key) || !val) return null;
				return `${key} = '${val}'`;
			})
			.filter(Boolean)
			.join(' AND ');
	}
}
