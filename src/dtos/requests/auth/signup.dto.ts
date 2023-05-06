import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { passwordValidation, vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class SignUpDto {
	@ApiProperty({
		type: String,
		description: 'Họ tên người dùng',
		minLength: 3,
		maxLength: 128,
		example: 'John Doe'
	})
	@IsNotEmpty()
	@IsString()
	fullname: string;

	@ApiProperty({
		type: String,
		description: 'Email của user',
		example: 'johndoe@email.com'
	})
	@IsNotEmpty()
	@IsEmail()
	@Transform(({ value }) => value.toLowerCase().trim())
	email: string;

	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsNotEmpty()
	@IsString()
	@Matches(vietNamesePhoneValidation)
	@Transform(({ value }) => value.trim())
	phone: string;

	@ApiProperty({
		type: String,
		description: 'Mật khẩu',
		example: 'Aa@123456',
		minLength: 8,
		maxLength: 32
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	@Matches(passwordValidation)
	password: string;

	@IsOptional()
	@ApiProperty()
	@IsString()
	seller_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	catalog_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	province_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	province_name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	district_id: number;

	@IsOptional()
	@IsString()
	district_name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	ward_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	ward_name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	address: string;
}
