import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
	@ApiProperty({ example: 'johndoe@gmail.com' })
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.trim().toLowerCase())
	username: string;

	@ApiProperty({ example: 'Aa@123456' })
	@IsNotEmpty()
	@IsString()
	password: string;
}
