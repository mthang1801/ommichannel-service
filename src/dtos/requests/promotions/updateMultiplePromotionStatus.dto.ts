import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMultiplePromotionStatusDto {
	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsNumber()
	status: number;

	@ApiPropertyOptional()
	@ArrayNotEmpty()
	promotion_ids: number[];
}
