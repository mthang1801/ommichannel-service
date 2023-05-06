import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCronFunctionSchedulerDto {
	@ApiProperty()
	@IsOptional()
	@IsNumber()
	scheduler_id: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@IsOptional()
	@IsString()
	start_at: string;

	@IsOptional()
	@IsString()
	stop_at: string;
}
