import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Op } from 'sequelize';
import { isEmptyObject } from '../../../utils/functions.utils';

export class CategoryQueryParamsDto {
	@ApiProperty({ example: 'dien thoai' })
	@IsOptional()
	@IsString()
	q?: string;

	@ApiProperty({ example: 'dien thoai' })
	@IsOptional()
	@Transform(({ value }) => Number(value))
	catalog_id?: number;

	@ApiProperty({ example: 'dien thoai' })
	@IsOptional()
	@Transform(({ value }) => (value === 'true' ? 1 : 0))
	@IsNumber()
	status?: number;	

	static getQueryParamsClauseByAttributeId(queryParams, attributeId: number) {
		const { q, catalog_id, status } = queryParams;
		return [{ q }, { catalog_id }, { status }, { attribute_id: attributeId }]
			.filter((item) => !isEmptyObject(item))
			.map((_whereClause, ele) => {
				Object.entries(ele).map(([key, val]) => {
					switch (key) {
						case 'q':
							{
								_whereClause['category_name'] = {
									[Op.like]: `%${q}%`
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
