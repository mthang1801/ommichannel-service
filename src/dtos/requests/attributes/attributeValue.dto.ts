import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class AttributeValuesDto {
	@IsOptional()
	value_name: string;

	@IsOptional()
	@Transform(({ value }) => (value ? value.trim() : value))
	value: string;

	@IsOptional()
	index: number;
}
