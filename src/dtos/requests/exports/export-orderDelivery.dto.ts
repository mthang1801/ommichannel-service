import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportOrderDeliveriesListDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value.split(',').map(Number))
	ids: number[];
}
