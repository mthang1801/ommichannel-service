import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueDto {
	@ApiProperty()
	attribute_id: number;

	@ApiProperty()
	value_id: number;
}
