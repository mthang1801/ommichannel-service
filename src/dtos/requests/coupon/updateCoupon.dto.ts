import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsNotEmpty, IsArray } from 'class-validator';
export class UpdateCouponDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	coupon_name: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	coupon_code: string;

	@ApiProperty()
	@IsOptional()
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
	@IsOptional()
	utm_sources: number[];

	@ApiProperty()
	@IsOptional()
	apply_for_customer_rankings: number[];

	@ApiProperty()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	discount_type: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	total_discount_amount: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	discount_amount: number;

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
	@IsOptional()
	@IsNumber()
	coupon_apply_type: number;

	@ApiProperty()
	@IsOptional()
	entities: Entity[];

	@ApiProperty()
	@IsOptional()
	removed_entity_ids: number[];

	@ApiProperty()
	@IsOptional()
	coupon_details: CouponDetailCode[];

	@ApiProperty()
	@IsOptional()
	removed_coupon_detail_ids: number[];
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
