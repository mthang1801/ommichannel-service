import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { filterQueryParams } from 'src/utils/functions.utils';

export class ReportDeliveryQueryParamDto {
	@ApiPropertyOptional({ description: 'Lọc theo tỉnh' })
	@IsOptional()
	@Transform(({ value }) => Number(value) || undefined)
	s_province: number;

	@ApiPropertyOptional({ description: 'Lọc theo đơn vị vận chuyển' })
	@IsOptional()
	@Transform(({ value }) => Number(value) || undefined)
	shipping_unit_id: number;

	static getReportDeliveryQueryParam(
		sellerId: number,
		queryParam: ReportDeliveryQueryParamDto,
		isSpecialAdmin: boolean
	) {
		if (queryParam.s_province) {
			queryParam['s_province_id'] = queryParam.s_province;
			delete queryParam.s_province;
		}
		const filteredQueryParams = filterQueryParams({
			...queryParam,
			seller_id: sellerId
		});

		return Object.entries(filteredQueryParams)
			.map(([_, [key, val]]: any) => {
				if (!val || key === 'shipping_unit_id') return null;
				return `${key} = '${val}'`;
			})
			.filter(Boolean)
			.join(' AND ');
	}
}
