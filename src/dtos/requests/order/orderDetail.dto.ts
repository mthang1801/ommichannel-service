import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DiscountTypeEnum } from 'src/common/constants/enum';

export class OrderDetailDto {
	@ApiProperty()
	@IsOptional()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	sku: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	barcode: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	product_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	product_name: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	quantity: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	price: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	discount = 0;

	@ApiProperty()
	@IsOptional()
	@IsEnum(DiscountTypeEnum)
	discount_type: DiscountTypeEnum = DiscountTypeEnum.Fixed;
}
