import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateAttributeCategoryDto {
	@ApiProperty({ example: [1, 2, 3] })
	@IsOptional()
	@IsArray()
	new_categories: number[];

	@ApiProperty()
	@IsOptional()
	@IsArray()
	removed_categories: number[];
}
