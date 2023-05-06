import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCronFunctionSchedulerDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	cron_function_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	scheduler_id: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@IsNotEmpty()
	@IsString()
	start_at: string;

	@IsNotEmpty()
	@IsString()
	stop_at: string;
}
