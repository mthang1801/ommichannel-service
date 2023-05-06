import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSchedulerDto {
	@ApiProperty()
	@IsOptional()
	@IsNumber()
	scheduler_interval: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: string;
}
