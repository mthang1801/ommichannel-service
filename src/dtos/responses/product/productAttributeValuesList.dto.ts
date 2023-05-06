import { ApiProperty } from '@nestjs/swagger';

export class ProductAttributeValuesListDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	product_id: number;

	@ApiProperty()
	attribute_id: number;

	@ApiProperty()
	value_id: number;

	@ApiProperty()
	value: string;

	@ApiProperty()
	attribute_code: string;

	@ApiProperty()
	attribute_name: string;
}
