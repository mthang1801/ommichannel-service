import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Op } from 'sequelize';
import { filterQueryParams } from 'src/utils/functions.utils';

export class CatalogQueryParamsDto {
	@ApiPropertyOptional({ example: 'Điện thoại' })
	@IsOptional()
	@IsString()
	q?: string;

	@ApiPropertyOptional({ example: true })
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	status?: boolean;

	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	page?: number;

	@ApiPropertyOptional({ example: 10 })
	@IsOptional()
	limit?: number;

	static getQueryParamsWhereClause(queryParams: CatalogQueryParamsDto) {
		const filteredQueryParams = filterQueryParams(queryParams);
		return Object.entries(filteredQueryParams).reduce((whereClause: any, [_, [key, val]]: any) => {
			switch (key) {
				case 'q':
					{
						whereClause['catalog_name'] = {
							[Op.like]: `%${val}%`
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
