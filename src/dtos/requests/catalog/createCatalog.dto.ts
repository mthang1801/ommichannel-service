import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCatalogDto {
	@ApiProperty({ example: 'Điện thoại' })
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.split(' ').filter(Boolean).join(' ').trim())
	catalog_name: string;

	@ApiProperty({ example: 'Trạng thái' })
	@IsOptional()
	@IsBoolean()
	status = true;
}
