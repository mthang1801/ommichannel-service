import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Op } from 'sequelize';
import { filterQueryParams } from 'src/utils/functions.utils';

export class GetPromotionProgramListDto {
	@ApiPropertyOptional()
	@IsOptional()
	page: number;

	@ApiPropertyOptional()
	@IsOptional()
	limit: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	q: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	program_type: number;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_start: string;

	@ApiPropertyOptional()
	@IsOptional()
	created_at_end: string;

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

	static filterPromotionProgramsList(sellerId: number, data: GetPromotionProgramListDto) {
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
					case 'created_at_start':
					case 'created_at_end':
						{
							whereClause['created_at'] = {
								[Op.between]: [`${data.created_at_start} 00:00:00`, `${data.created_at_end} 23:59:59`]
							};
						}
						break;
					case 'start_at':
						{
							whereClause['start_at'] = {
								[Op.gte]: val
							};
						}
						break;
					case 'start_at':
						{
							whereClause['end_at'] = {
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
