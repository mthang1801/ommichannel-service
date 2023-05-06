import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCronFunctionDto {
	@ApiProperty()
	@IsOptional()
	@IsNumber()
	data_type_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: string;
}
