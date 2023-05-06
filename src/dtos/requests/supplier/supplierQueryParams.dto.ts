import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SupplierQueryParamsDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	page? = 1;

	@ApiProperty({ example: 10 })
	@IsOptional()
	limit? = 10;

	@IsOptional()
	q?: string;

	@IsOptional()
	status?: string;
}
