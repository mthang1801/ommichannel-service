import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ProductAttributeValuesListDto } from './productAttributeValuesList.dto';

export class ProductAttributesListDto {
	@ApiProperty()
	attribute_id: number;

	@ApiProperty({
		type: 'array',
		items: {
			allOf: [{ $ref: getSchemaPath(ProductAttributeValuesListDto) }]
		}
	})
	values: ProductAttributeValuesListDto[];
}
