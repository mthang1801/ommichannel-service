import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
	IsBoolean,
	IsDateString,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	Matches,
	ValidateNested
} from 'class-validator';
import { CustomerTypeEnum, UserGenderEnum } from 'src/common/constants/enum';
import { vietNamesePhoneValidation } from 'src/utils/functions.utils';
import { CustomerAddress } from './customerAddress.dto';

export class UpdateCustomerDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	fullname: string;

	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@IsOptional()
	@Matches(vietNamesePhoneValidation, { message: 'Điện thoại không đúng định dạng.' })
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

	@IsOptional()
	@IsDateString()
	date_of_birth: Date;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(UserGenderEnum)
	gender: UserGenderEnum;

	@IsOptional()
	@ValidateNested()
	@Type(() => CustomerAddress)
	new_shipping_info: CustomerAddress[] = [];

	@ApiProperty()
	@IsOptional()
	@IsEnum(CustomerTypeEnum)
	customer_type: CustomerTypeEnum;

	@IsOptional()
	@ValidateNested()
	@Type(() => CustomerAddress)
	updated_shipping_info: CustomerAddress[] = [];

	@IsOptional()
	removed_shipping_info: number[] = [];
}
