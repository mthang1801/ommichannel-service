import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { CustomerAddressTypesEnum } from 'src/common/constants/enum';
import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class CustomerAddress {
	@IsOptional()
	@IsNumber()
	id?: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	fullname: string;

	@ApiProperty({
		type: String,
		description: 'Email của user',
		example: 'johndoe@email.com'
	})
	@IsOptional()
	@IsEmail()
	@Transform(({ value }) => (value ? value.toLowerCase().trim() : null))
	email: string;

	@IsOptional()
	@IsBoolean()
	default: boolean;

	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsOptional()
	@IsString()
	@Matches(vietNamesePhoneValidation)
	@Transform(({ value }) => value.trim())
	phone: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	order_no: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	province_id: number;

	@ApiProperty()
	@IsOptional()
	declare geolocation: any;

	@ApiProperty()
	@IsOptional()
	@IsString()
	province_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	district_id: number;

	@ApiProperty()
	@IsString()
	@IsOptional()
	district_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	ward_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	ward_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address: string;

	@ApiProperty()
	@IsEnum(CustomerAddressTypesEnum)
	address_type: CustomerAddressTypesEnum;
}
