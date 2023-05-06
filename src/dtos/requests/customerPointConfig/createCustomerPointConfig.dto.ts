import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerPointConfigDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	point_name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	start_at: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	end_at: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	accumulated_money: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	accumulated_point: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	used_money: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	used_point: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	min_point: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	max_point: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	auto_point_from: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	point_round_to_down: boolean;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	sms_verify_point: boolean;
}
