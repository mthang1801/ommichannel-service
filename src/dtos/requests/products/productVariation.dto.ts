import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttributeValue } from 'src/models/attributeValue.model';

export class ProductVariation {
	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	id?: number;

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
	@IsString()
	product_name: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	virtual_stock_quantity: number = 0;

	@ApiProperty({
		type: 'array',
		items: {
			oneOf: [{ $ref: getSchemaPath(AttributeValue) }]
		},
		example: [
			{ attribute_id: 1, value_id: 1 },
			{ attribute_id: 2, value_id: 2 }
		]
	})
	@ApiPropertyOptional()
	@ApiProperty()
	@IsOptional()
	@IsArray()
	attributes: { attribute_id: number; value_id: number }[];

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	retail_price: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	wholesale_price: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	listed_price: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	return_price: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	import_price: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	thumbnail: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	index: number;
}
