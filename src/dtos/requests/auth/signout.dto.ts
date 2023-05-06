import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SignoutDto {
	@ApiProperty({description : "Token"})
	@IsNotEmpty()
	@IsString()
	token : string;

	@ApiProperty({description : "uuid"})
	@IsNotEmpty()
	@IsString()
	uuid : string;
}