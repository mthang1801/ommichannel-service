import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { CustomerTypeEnum, UserGenderEnum } from 'src/common/constants/enum';

import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

export class UpdateWarehouseDto {
	@ApiProperty({
		type: String,
		description: 'Số điện thoại',
		example: '0987654321',
		format: vietNamesePhoneValidation.toString()
	})
	@IsOptional()
	@IsString()
	@Matches(vietNamesePhoneValidation, {
		message: 'Điện thoại không đúng định dạng.'
	})
	@Transform(({ value }) => value?.trim())
	phone: string;

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
	@IsString()
	contract_id: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	qty_in_stock: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@IsOptional()
	staffs: WarehouseStaff[];

	@IsOptional()
	more_staffs: MoreWarehouseStaff[];
}

class WarehouseStaff {
	@IsNotEmpty()
	@IsNumber()
	user_id: number;

	@IsOptional()
	@IsBoolean()
	status: boolean;
}

class MoreWarehouseStaff {
	@IsNotEmpty()
	@IsNumber()
	user_id: number;

	@IsOptional()
	@IsBoolean()
	status: boolean;
}
