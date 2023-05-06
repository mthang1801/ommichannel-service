import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCatalogDto {
	@ApiProperty({ example: 'Điện thoại' })
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (value ? value.split(' ').filter(Boolean).join(' ').trim() : value))
	catalog_name: string;

	@ApiProperty({ example: 'Trạng thái' })
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiProperty({ example: [1, 2, 3, 4], type: [Number] })
	@IsOptional()
	@IsArray()
	category_ids: number[];
}
