import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SellerPlatformQueryParamsDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	page = 1;

	@ApiProperty({ example: 10 })
	@IsOptional()
	limit = 10;

	@IsOptional()
	platform_id: number;

	@IsOptional()
	status: string;
}
