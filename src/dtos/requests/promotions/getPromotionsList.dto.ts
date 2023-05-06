import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { filterQueryParams } from 'src/utils/functions.utils';

export class GetPromotionsListDto {
	@ApiPropertyOptional()
	@IsOptional()
	page: number;

	@ApiPropertyOptional()
	@IsOptional()
	limit: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	status: number;

	@ApiPropertyOptional()
	@IsOptional()
	q: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	program_type: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({value}) => `${value} 00:00:00`)
	start_date: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({value}) => `${value} 23:59:59`)
	end_date: string;

	@ApiPropertyOptional()
	@IsOptional()
	start_at: string;

	@ApiPropertyOptional()
	@IsOptional()
	end_at: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	store_id: string;

	static filterPromotionProgramsList(sellerId: number, data: GetPromotionsListDto) {		
		return Object.entries(filterQueryParams(data)).reduce(
			(whereClause: any, [_, [key, val]]: any) => {
				if ([undefined, null].includes(val)) {
					return whereClause;
				}
				switch (key) {
					case 'q':
						{
							whereClause = {
								...whereClause,
								[Op.or]: [
									{
										program_name: {
											[Op.like]: `%${val}%`
										}
									},
									{
										program_code: {
											[Op.like]: `%${val}%`
										}
									}
								]
							};
						}
						break;				
					case 'start_date':
						{
							whereClause['start_date'] = {
								[Op.gte]: val
							};
						}
						break;
					case 'end_date':
						{
							whereClause['end_date'] = {
								[Op.lte]: val
							};
						}
						break;					
					default: {
						whereClause[key] = val;
					}
				}
				return whereClause;
			},
			{
				seller_id: sellerId
			}
		);
	}
}
