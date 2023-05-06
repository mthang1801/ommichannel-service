import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { UserAccountStatusActionTypeEnum } from 'src/common/constants/enum';

export class ActivateAccountDto {
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

	@ApiProperty()
	@IsOptional()	
	type: UserAccountStatusActionTypeEnum = UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT;
}
