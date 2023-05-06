import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVoucherDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	voucher_code: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	voucher_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	amount: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	type: number;

	@ApiProperty()
	@IsOptional()
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
