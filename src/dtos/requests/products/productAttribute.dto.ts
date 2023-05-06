import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ProductAttributeDto {
	@ApiPropertyOptional({ example: 1 })
	@IsNotEmpty()
	attribute_id: number;

	@ApiPropertyOptional({ example: '1,2,3,4' })
	@IsOptional()
	value_ids: string;

	@ApiPropertyOptional({ example: 'test' })
	@IsOptional()
	text_value: string;
}
