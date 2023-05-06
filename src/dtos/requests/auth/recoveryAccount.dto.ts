import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryAccountDto {
	@ApiProperty()
	@IsEmail()
	@IsNotEmpty()
	email: string;
}
