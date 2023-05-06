import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ProductLogQueryParamsDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	module_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	log_type_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	from_date: Date;

	@ApiPropertyOptional()
	@IsOptional()
	to_date: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	page: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	limit: number;
}
