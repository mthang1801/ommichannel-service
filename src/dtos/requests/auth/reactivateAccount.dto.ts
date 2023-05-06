import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ReactivateAccountDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
