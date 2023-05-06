import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';
export class ApplyCouponDto {
	@ApiProperty()
	@ArrayNotEmpty()
	products: Product[];

	@ApiProperty()
	@IsNotEmpty()
	code: string;

	@ApiProperty()
	@IsNotEmpty()
	utm_source: number;

	@ApiProperty()
	@IsNotEmpty()
	order_total_amount: number;
}

class Product {
	@IsNotEmpty()
	@IsNumber()
	id: number;

	@IsNotEmpty()
	@IsNumber()
	amount: number;
}
