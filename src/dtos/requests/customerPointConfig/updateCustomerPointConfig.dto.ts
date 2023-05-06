import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerPointConfigDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	point_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	start_at: string;

	@ApiProperty()
	@IsOptional()
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
	@IsOptional()
	@IsNumber()
	accumulated_money: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	accumulated_point: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	used_money: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	used_point: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	min_point: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	max_point: number;

	@ApiProperty()
	@IsOptional()
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
