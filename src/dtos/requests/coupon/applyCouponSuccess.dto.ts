import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ApplyCouponSuccessDto {
	@ApiProperty()
	@IsNotEmpty()
	code: string;

	@ApiProperty()
	@IsNotEmpty()
	total_discount_amount: number;
}
