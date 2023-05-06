import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class VerifyTokenDto {
	@ApiPropertyOptional()
	@IsOptional()
	token: string;
}