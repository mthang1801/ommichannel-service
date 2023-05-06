import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserSystemDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	fullname: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	role_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	phone: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	password: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	email: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	account_number: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	account_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	bank_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	bank_branch_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	ward_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	district_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	province_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	ward_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	district_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	province_name: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	warehouses: WarehouseStaff[] = [];
}

class WarehouseStaff {
	@IsNotEmpty()
	@IsNumber()
	warehouse_id: number;

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
