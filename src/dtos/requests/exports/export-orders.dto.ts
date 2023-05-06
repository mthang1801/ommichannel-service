import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportOrdersListDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value.split(',').map(Number))
	order_ids: number[];
}
