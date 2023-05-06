import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

class CatalogIndexDto {
	@ApiProperty({ example: 1 })
	@IsNotEmpty()
	id: number;

	@ApiProperty({ example: 0 })
	@IsNotEmpty()
	index: number;
}

export class UpdateCatalogIndexDto {
	@ApiProperty({
		type: 'array',
		example: [
			{ id: 1, index: 1 },
			{ id: 2, index: 2 }
		],
		items: { allOf: [{ $ref: getSchemaPath(CatalogIndexDto) }] }
	})
	@IsNotEmpty()
	@ValidateNested()
	@Type(() => CatalogIndexDto)
	catalogs: CatalogIndexDto[];
}
