import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

class CategoryIndexDto {
	@ApiProperty({ example: 1 })
	@IsNotEmpty()
	@IsNumber()
	category_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	category_index: number;

	@ApiProperty({ example: 1 })
	@IsNotEmpty()
	@IsNumber()
	catalog_id: number;
}

export class UpdateCategoryIndexDto {
	@ApiProperty({
		type: 'array',
		items: { allOf: [{ $ref: getSchemaPath(CategoryIndexDto) }] },
		example: [
			{
				catalog_id: 100000005,
				category_id: 20000001,
				category_index: 0
			},
			{
				catalog_id: 100000005,
				category_id: 20000002,
				category_index: 2
			},
			{
				catalog_id: 100000005,
				category_id: 20000003,
				category_index: 1
			},
			{
				catalog_id: 100000005,
				category_id: 20000004,
				category_index: 3
			}
		]
	})
	@ValidateNested()
	@Type(() => CategoryIndexDto)
	categories: CategoryIndexDto[];
}
