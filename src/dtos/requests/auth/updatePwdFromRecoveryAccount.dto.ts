import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePwdRecoveryAccountDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Length(20, 20)
	access_token: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Length(10, 10)
	secret_key: string;

	@ApiProperty({
		type: String,
		description: 'Mật khẩu',
		example: 'Aa@123456',
		minLength: 8,
		maxLength: 32
	})
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
		message: 'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.'
	})
	@IsString()
	password: string;
}
