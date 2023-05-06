import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional, IsNumber, ArrayNotEmpty } from 'class-validator';
export class UpdateStatusCouponListDto {
	@ApiProperty()
	@ArrayNotEmpty()
	coupon_ids: number[];

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	status: number;
}
