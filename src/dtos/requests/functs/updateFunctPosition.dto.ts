import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class FunctIndexDto {
	@ApiProperty({ example: 1 })
	@IsNotEmpty()
	@IsNumber()
	id: number;

	@ApiProperty({ example: 0 })
	@IsNotEmpty()
	@IsNumber()
	index: number;
}

export class UpdateFunctsIndexesDto {
	@ApiProperty()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => FunctIndexDto)
	funct_indexes: FunctIndexDto[];
}
