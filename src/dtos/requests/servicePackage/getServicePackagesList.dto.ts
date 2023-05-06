import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { filterQueryParams } from 'src/utils/functions.utils';

export class GetServicePackagesListDto {
	@ApiPropertyOptional()
	@IsOptional()
	q: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	status: string;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_start: string;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_end: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	price_from: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	price_to: number;

	static getPackageServiceListQueryParams(queryParams: GetServicePackagesListDto) {
		return Object.entries(filterQueryParams(queryParams)).reduce((whereClause: any, [_, [key, val]]: any) => {
			switch (key) {
				case 'q':
					{
						whereClause = {
							...whereClause,
							[Op.or]: [
								{
									service_name: {
										[Op.like]: `%${val}%`
									}
								},
								{
									service_code: {
										[Op.like]: `${val}%`
									}
								}
							]
						};
					}
					break;
				case 'created_at_start':
				case 'created_at_end':
					{
						whereClause.created_at = {
							[Op.between]: [queryParams.created_at_start, queryParams.created_at_end]
						};
					}
					break;

				default: {
					whereClause[key] = val;
				}
			}

			return whereClause;
		}, {});
	}
}
