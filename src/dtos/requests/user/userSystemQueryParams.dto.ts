import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserSystemQueryParamsDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	page? = 1;

	@ApiProperty({ example: 10 })
	@IsOptional()
	limit? = 10;

	@IsOptional()
	q?: string;

	@IsOptional()
	seller_id?: string;

	@IsOptional()
	status?: string;

	@IsOptional()
	created_at_start?: string;

	@IsOptional()
	created_at_end?: string;
}
