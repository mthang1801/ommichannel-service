import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { PromotionEntityDetailDto } from './promotionEntityDetail.dto';
export class PromotionEntityDto {
	@ApiPropertyOptional({ description: 'Id Chương trình' })
	@IsOptional()
	@IsNumber()
	id?: number;

	@ApiPropertyOptional({ description: 'Entity Id Chương trình' })
	@IsOptional()
	@IsNumber()
	entity_id: number;

	@ApiPropertyOptional({ description: 'Chi tiết Chương trình' })
	@IsOptional()
	@ValidateNested()
	@Type(() => PromotionEntityDetailDto)
	details: PromotionEntityDetailDto[];
}
