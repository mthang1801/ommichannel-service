import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportProductsListDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value.split(',').map(Number))
	product_ids: number[];
}
