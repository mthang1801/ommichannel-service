import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
export class PromotionEntityDetailDto {
	@ApiPropertyOptional({ description: 'Số lượng từ' })
	@IsOptional()
	id?: number;

	@ApiPropertyOptional({ description: 'Số lượng từ' })
	@IsOptional()
	quantity_from: number;

	@ApiPropertyOptional({ description: 'Số lượng đến' })
	@IsOptional()
	quantity_to: number;

	@ApiPropertyOptional({ description: 'Mức giá từ' })
	@IsOptional()
	total_price_from: number;

	@ApiPropertyOptional({ description: 'Mức giá đến' })
	@IsOptional()
	total_price_to: number;

	@ApiPropertyOptional({ description: 'Chiết khấu' })
	@IsOptional()
	discount_amount: number;

	@ApiPropertyOptional({ description: 'Kiểu Chiết khấu' })
	@IsOptional()
	discount_type: number;

	@ApiPropertyOptional({ description: 'Giới hạn KM' })
	@IsOptional()
	max_use_quantity: number;

	@ApiPropertyOptional({ description: 'SL đã sử dụng' })
	@IsOptional()
	used_quantity: number;
}
