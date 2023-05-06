import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ProportionDeliveryShippingFeeDto {
	@ApiPropertyOptional({description : "Tỉ trọng Chờ đóng gói"})
	@IsOptional()
	["Chờ đóng gói"] : number;

	@ApiPropertyOptional({description : "Tỉ trọng của Đã đóng gói"})
	@IsOptional()
	["Đã đóng gói"] : number;
}