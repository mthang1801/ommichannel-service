import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class GetPromotionEntitiesListDto {
	@ApiPropertyOptional({description : "page"})
	@IsOptional()
	@Transform(({value}) => Number(value))
	page: number;

	@ApiPropertyOptional({description : "limit"})
	@IsOptional()
	@Transform(({value}) => Number(value))
	limit: number;

	@ApiPropertyOptional({description : "promotion_apply_type"})
	@IsOptional()
	@Transform(({value}) => Number(value))
	promotion_apply_type: number;
}