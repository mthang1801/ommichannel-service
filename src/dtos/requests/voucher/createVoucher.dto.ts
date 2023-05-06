import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVoucherDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	voucher_code: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	voucher_name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	amount: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	type: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	discount: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	min_order_value: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	max_discount: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	start_at: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	stop_at: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;
}
