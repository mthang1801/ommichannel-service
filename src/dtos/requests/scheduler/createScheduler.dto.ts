import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSchedulerDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	scheduler_interval: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: string;
}
