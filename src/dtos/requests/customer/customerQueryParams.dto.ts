import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { CustomerRankingEnum } from 'src/common/constants/enum';
import { isEmptyObject } from 'src/utils/functions.utils';

export class CustomerQueryParamsDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	page = 1;

	@ApiProperty({ example: 10 })
	@IsOptional()
	limit = 10;

	@IsOptional()
	q: string;

	@IsOptional()
	@Transform(({ value }) => value === 'true')
	status: boolean;

	@IsOptional()
	ranking: CustomerRankingEnum;

	@IsOptional()
	@Transform(({ value }) => (value ? value.trim() + ' 00:00:00' : value))
	created_at_start: string;

	@IsOptional()
	@Transform(({ value }) => (value ? value.trim() + ' 23:59:59' : value))
	created_at_end: string;

	@IsOptional()
	customer_type: number;

	static getCustomerQueryParamsClause(sellerId: number, queryParams) {
		const { status, q, ranking, created_at_start, created_at_end, customer_type } = queryParams;
		return [
			{ q },
			{ seller_id: sellerId },
			{ status },
			{ ranking },
			{ customer_type },
			{ created_at_start, created_at_end }
		]
			.filter((item) => !isEmptyObject(item))
			.reduce((_whereClause, ele) => {
				Object.entries(ele).forEach(([key, val]) => {
					switch (key) {
						case 'q':
							{
								_whereClause = {
									..._whereClause,
									[Op.or]: {
										fullname: {
											[Op.like]: `%${val}%`
										},
										phone: {
											[Op.like]: `${val}%`
										},
										email: {
											[Op.like]: `${val}%`
										}
									}
								};
								console.log(_whereClause);
							}
							break;
						case 'created_at_start':
						case 'created_at_end':
							{
								_whereClause['created_at'] = {
									[Op.between]: [ele.created_at_start, ele.created_at_end]
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
