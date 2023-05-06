import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class GenCouponDetailCodeDto {
	@IsNotEmpty()
	@IsString()
	prefix: string;

	@IsNotEmpty()
	@IsNumber()
	character_amount: number;

	@IsNotEmpty()
	@IsString()
	suffix: string;

	@IsNotEmpty()
	@IsNumber()
	code_amount: number;
}
