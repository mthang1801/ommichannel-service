import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
	IsDateString,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	ValidateNested
} from 'class-validator';
import { CustomerTypeEnum, UserGenderEnum } from 'src/common/constants/enum';

import { vietNamesePhoneValidation } from 'src/utils/functions.utils';
import { CustomerAddress } from './customerAddress.dto';
export class CreateCustomerDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	fullname: string;

	@ApiProperty({
		type: String,
		description: 'Email của user',
		example: 'johndoe@email.com'
	})
	@IsOptional()
	@IsEmail()
	@Transform(({ value }) => value?.toLowerCase()?.trim())
	email: string;

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

	@ApiProperty()
	@IsOptional()
	@IsEnum(UserGenderEnum)
	gender: UserGenderEnum;

	@ApiProperty()
	@IsOptional()
	@IsDateString()
	date_of_birth: Date;

	@ApiProperty()
	@IsOptional()
	@IsEnum(CustomerTypeEnum)
	customer_type: CustomerTypeEnum;

	@IsOptional()
	@Type(() => CustomerAddress)
	@ValidateNested()
	shipping_info: CustomerAddress[] = [];
}
