import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { Op } from 'sequelize';
import { isEmptyObject } from 'src/utils/functions.utils';

export class FunctQueryParams {
	@IsOptional()
	@IsString()
	q?: string;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	status?: boolean;

	@IsOptional()
	@IsDateString()
	created_at_start?: Date;

	@IsOptional()
	@IsDateString()
	created_at_end?: Date;

	@IsOptional()
	page = 1;

	@IsOptional()
	limit = 10;

	@IsOptional()
	parent_id: number;

	static getQueryParamsWhereClause(queryParams: FunctQueryParams, isFindChildren = false) {
		const { q, status, created_at_start, created_at_end, parent_id } = queryParams;
		return [{ q }, { status }, { parent_id }, { created_at_start, created_at_end }]
			.filter((ele) => {
				return !isEmptyObject(ele);
			})
			.reduce(
				(_whereClause: any, ele) => {
					Object.entries(ele).map(([key, val]) => {
						switch (key) {
							case 'q':
								{
									_whereClause = {
										..._whereClause,
										[Op.or]: [
											{
												api_route: {
													[Op.like]: `%${val}%`
												}
											},
											{
												ui_route: {
													[Op.like]: `%${val}%`
												}
											},
											{
												funct_name: {
													[Op.like]: `%${val}%`
												}
											},
											{
												funct_code: {
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
										[Op.between]: [
											ele.created_at_start + ' 00:00:00',
											ele.created_at_end + ' 23:59:59'
										]
									};
								}
								break;
							default: {
								_whereClause[key] = val;
							}
						}
					});

					return _whereClause;
				},
				isFindChildren ? {} : { level: 0 }
			);
	}
}
