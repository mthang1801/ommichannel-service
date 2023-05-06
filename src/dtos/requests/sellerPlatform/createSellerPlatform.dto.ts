import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSellerPlatformDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	platform_id: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;
}
