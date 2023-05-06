import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { isNotEmptyObject, IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { isEmptyObject } from 'src/utils/functions.utils';

export class RoleQueryParamsDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value.trim())
	q: string;

	@ApiPropertyOptional()
	@IsOptional()
	page: number;

	@ApiPropertyOptional()
	@IsOptional()
	limit: number;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_start: string;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_end: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	level: number;

	@ApiPropertyOptional()
	@IsOptional()
	seller_id: number;

	static getWhereClauseQueryParams(queryParams: RoleQueryParamsDto) {
		const { q, created_at_start, created_at_end, status, level, seller_id } = queryParams;

		return [{ q }, { created_at_start, created_at_end }, { status }, { level }, { seller_id }]
			.filter((item) => !isEmptyObject(item))
			.reduce((_whereClause: any, ele: any) => {
				Object.entries(ele).map(([key, val]) => {
					switch (key) {
						case 'q':
							{
								_whereClause = {
									..._whereClause,
									[Op.or]: [
										{
											['role_name']: {
												[Op.like]: `%${val}%`
											}
										},
										{
											['role_code']: {
												[Op.like]: `%${val}%`
											}
										}
									]
								};
							}
							break;
						case 'created_at_start':
						case 'created_at_end':
							{
								_whereClause['created_at'] = {
									[Op.between]: [created_at_start + ' 00:00:00', created_at_end + ' 23:59:59']
								};
							}
							break;
						case 'level':
							{
								_whereClause['level'] = {
									[Op.gt]: level
								};
							}
							break;
						default: {
							_whereClause[key] = val;
						}
					}
				});
				return _whereClause;
			}, {});
	}
}
