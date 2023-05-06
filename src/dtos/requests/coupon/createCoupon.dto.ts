import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
export class CreateCouponDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	coupon_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	coupon_code: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	start_at: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	end_at: string;

	// @ApiProperty()
	// @IsOptional()
	// @IsBoolean()
	// status: boolean;

	@ApiProperty()
	@ArrayNotEmpty()
	utm_sources: number[];

	@ApiProperty()
	@ArrayNotEmpty()
	apply_for_customer_rankings: number[];

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	discount_type: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	discount_amount: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	max_discount_amount: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	max_used: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	customer_max_used: number;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	apply_for_other_promotions: boolean;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	order_price_from: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	coupon_apply_type: number;

	@ApiProperty()
	@IsOptional()
	entities: Entity[];

	@ApiProperty()
	@IsOptional()
	coupon_detail_codes: CouponDetailCode[];
}

class Entity {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	entity_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	min_product_amount: number;
}

class CouponDetailCode {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	coupon_detail_code: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	status: boolean;
}
