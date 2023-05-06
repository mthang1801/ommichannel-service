import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { vietNamesePhoneValidation } from 'src/utils/functions.utils';
import {
	ArrayNotEmpty,
	IsNotEmpty,
	IsString,
	IsNumber,
	IsOptional,
	Matches,
	IsBoolean,
	IsEmail
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserSystemDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	fullname: string;

	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsNotEmpty()
	@IsString()
	@Matches(vietNamesePhoneValidation, {
		message: 'Điện thoại không đúng định dạng.'
	})
	@Transform(({ value }) => value.trim())
	phone: string;

	@ApiProperty({
		type: String,
		description: 'Email của user',
		example: 'johndoe@email.com'
	})
	@IsOptional()
	@IsEmail()
	@Transform(({ value }) => value?.toLowerCase()?.trim())
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsNotEmpty()
	@IsNumber()
	role_id: number;

	@IsOptional()
	@IsString()
	account_number: string;

	@IsOptional()
	@IsString()
	account_name: string;

	@IsOptional()
	@IsNumber()
	bank_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	bank_branch_id: number;

	@IsOptional()
	@IsNumber()
	province_id: number;

	@IsOptional()
	@IsString()
	province_name: string;

	@IsOptional()
	@IsNumber()
	district_id: number;

	@IsOptional()
	@IsString()
	district_name: string;

	@IsOptional()
	@IsNumber()
	ward_id: number;

	@IsOptional()
	@IsString()
	ward_name: string;

	@IsOptional()
	@IsString()
	address: string;

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
