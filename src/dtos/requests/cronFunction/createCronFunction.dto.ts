import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCronFunctionDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	platform_id: number;

	@ApiProperty()
	@IsNotEmpty()
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
