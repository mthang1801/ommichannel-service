import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CodAndCarriageBillStatusEnum } from 'src/common/constants/enum';
import { previousDaysFromNow, today } from 'src/utils/dates.utils';
import { filterData } from 'src/utils/functions.utils';

export class CodAndCarriageBillOverviewDto {
	@ApiPropertyOptional({ description: 'Trạng thái' })
	@IsOptional()
	@IsEnum(CodAndCarriageBillStatusEnum)
	for_control_status: number;

	@ApiPropertyOptional()
	@IsOptional()
	date_range: number;

	@ApiPropertyOptional({ description: 'Đối tác' })
	@IsOptional()
	shipping_unit_id: string;

	static getCodAndCarriageBillOverviewQueryParam(
		sellerId: number,
		queryParams: CodAndCarriageBillOverviewDto,
		isSpecialAdmin: boolean
	) {
		const filteredQueryParams: any = filterData({
			...queryParams,
			start_date: queryParams.date_range
				? `${previousDaysFromNow(queryParams.date_range)} 00:00:00`
				: `${today()} 00:00:00`,
			end_date: `${today()} 23:59:59`,
			seller_id: sellerId
		});

		delete filteredQueryParams.date_range;

		return Object.entries(filteredQueryParams)
			.map(([key, val]: any) => {
				console.log(key, val);
				if (key === 'start_date') {
					return `created_at BETWEEN '${filteredQueryParams.start_date}' AND '${filteredQueryParams.end_date}'`;
				}
				if (['end_date'].includes(key)) return null;
				return `${key} = '${val}'`;
			})
			.filter(Boolean)
			.join(' AND ');
	}
}
