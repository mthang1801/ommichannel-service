import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';

export class CategoryAttributeIndexDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	category_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	attribute_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	index: number;
}

export class UpdateCategoryAttributeIndexDto {
	@ApiProperty({
		example: [
			{ category_id: 1, attribute_id: 1, index: 0 },
			{ category_id: 1, attribute_id: 2, index: 1 }
		]
	})
	@IsArray()
	@ValidateNested()
	@Type(() => CategoryAttributeIndexDto)
	public category_attributes: CategoryAttributeIndexDto[];
}
