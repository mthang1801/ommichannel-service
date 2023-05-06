import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PromotionProgramDetailDto {
	@ApiProperty({ description: 'Id SP' })
	@IsNotEmpty()
	product_id: number;

	@ApiProperty({ description: 'Vị trí hiển thị' })
	@IsOptional()
	idx: number;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@IsOptional()
	status: boolean;

	@ApiPropertyOptional({ description: 'Giá Khuyến mãi' })
	@IsOptional()
	promotion_price: number;

	@ApiPropertyOptional({ description: 'Giá mua lại hoặc KH không lấy (áp dụng quà tặng)' })
	@IsOptional()
	repurchase_price: number;

	@ApiPropertyOptional({ description: 'Áp dụng SP bán từ' })
	@IsOptional()
	apply_product_price_from: number;

	@ApiPropertyOptional({ description: 'Áp dụng SP giá bán đến' })
	@IsOptional()
	apply_product_price_to: number;

	@ApiPropertyOptional({ description: 'Khuyến mãi' })
	@IsOptional()
	discount_amount: number ;

	@ApiPropertyOptional({ description: 'Kiểu khuyến mãi, 1: fixed, 2: percentage' })
	@IsOptional()
	discount_type: number;
}
