import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class CreateWarehouseDto {
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
	@IsNotEmpty()
	@IsString()
	warehouse_code: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	warehouse_name: string;

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
	longitude: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	latitude: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	staffs: WarehouseStaff[] = [];
}

class WarehouseStaff {
	@IsNotEmpty()
	@IsNumber()
	user_id: number;

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
