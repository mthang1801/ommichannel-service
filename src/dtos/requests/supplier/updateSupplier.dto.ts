import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class UpdateSupplierDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	supplier_name: string;

	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsOptional()
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
	@IsOptional()
	@IsNumber()
	province_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	district_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	ward_id: number;

	@ApiProperty()
	@IsOptional()
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
	payment_method_id: number;

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
	@IsBoolean()
	status: boolean;
}
