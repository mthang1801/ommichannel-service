import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ProportionDeliveryShippingFeeByShippingUnitDto {
	@ApiPropertyOptional({description : "Tỉ trọng của NTL"})
	@IsOptional()
	NTL : number;

	@ApiPropertyOptional({description : "Tỉ trọng của NTX"})
	@IsOptional()
	NTX : number;
}