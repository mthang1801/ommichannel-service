import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserGenderEnum } from 'src/common/constants/enum';

export class UpdateUserProfileDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	avatar: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	fullname: string;

	@ApiProperty()
	@IsOptional()
	@IsEnum(UserGenderEnum)
	gender: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	date_of_birth: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	ward_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	district_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	province_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	ward_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	district_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	province_name: string;

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
	bank_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	bank_branch_id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	current_password: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	new_password: string;
}
