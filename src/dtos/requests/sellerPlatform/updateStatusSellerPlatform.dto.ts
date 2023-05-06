import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStatusSellerPlatformDto {
	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	locked: boolean;
}
