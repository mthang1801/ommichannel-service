import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignInProviderDto {
	@ApiProperty()
	@IsNotEmpty()
	providerId: string;

	@ApiProperty()
	@IsOptional()
	familyName: string;

	@ApiProperty()
	@IsOptional()
	givenName: string;

	@ApiProperty()
	@IsNotEmpty()
	email: string;

	@ApiProperty()
	@IsOptional()
	phone: string;

	@ApiPropertyOptional()
	@IsNotEmpty()
	imageUrl: string;

	@ApiPropertyOptional()
	@IsOptional()
	extra_data: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	seller_name: string;

	@ApiPropertyOptional()
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

	@ApiPropertyOptional()
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
