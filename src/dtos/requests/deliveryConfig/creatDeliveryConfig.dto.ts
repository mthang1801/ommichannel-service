import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateDelieveryConfigDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	warehouse_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	cod = 0;

	@ApiPropertyOptional()
	@IsOptional()
	weight = 0;

	@ApiPropertyOptional()
	@IsOptional()
	length = 0;

	@ApiPropertyOptional()
	@IsOptional()
	width = 0;

	@ApiPropertyOptional()
	@IsOptional()
	height = 0;

	@ApiPropertyOptional()
	@IsOptional()
	delivery_request: string;

	@ApiPropertyOptional()
	@IsOptional()
	delivery_note: string;
}
