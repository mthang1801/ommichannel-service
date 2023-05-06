import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class CreateSupplierDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	supplier_code: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	supplier_name: string;

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

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	province_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	district_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	ward_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	address: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	tax_code: string;

	@IsOptional()
	@IsString()
	fax: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	website: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	account_number: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	account_name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	payment_method_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	bank_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	bank_branch_id: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;
}
