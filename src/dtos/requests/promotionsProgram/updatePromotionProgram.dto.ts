import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PromotionApplyTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';

export class UpdatePromotionProgramDto {
	@ApiPropertyOptional({ description: 'Tên chương trình' })
	@IsOptional()
	program_name: string;

	@ApiPropertyOptional({ description: 'Mã chương trình' })
	@IsOptional()
	@Transform(({ value }) => value.trim().toUpperCase())
	program_code: string;

	@ApiPropertyOptional({ description: 'Mô tả chương trình' })
	@IsOptional()
	description: string;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@IsOptional()
	status: boolean;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@IsOptional()
	@Transform(({ value }) => `${value} 00:00:00`)
	start_at: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@IsOptional()
	@Transform(({ value }) => `${value} 23:59:59`)
	end_at: string;

	@ApiPropertyOptional({ description: 'Loại KM' })
	@IsOptional()
	discount_type: number;

	@ApiPropertyOptional({ description: 'giá trị KM' })
	@IsOptional()
	discount_amount: number;

	@ApiPropertyOptional({ description: 'giá trị KM tối đa' })
	@IsOptional()
	max_discount_amount: number;

	@ApiPropertyOptional({
		description: `áp dụng cho ${Object.entries(PromotionApplyTypeEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@IsOptional()
	@IsNumber()
	@IsEnum(PromotionApplyTypeEnum)
	promotion_apply_type: PromotionApplyTypeEnum;

	@ApiPropertyOptional({ description: 'Điều kiện áp dụng Hoá đơn tối thiểu từ' })
	@IsOptional()
	@IsNumber()
	min_price_from ;

	@ApiPropertyOptional({ description: 'SP hoặc danh mục áp dụng cho chương trình' })
	@IsOptional()
	promotion_entity_ids: number[];

	static checkPromotionProgramDataVadidation({
		start_at,
		end_at,
		promotion_apply_type,		
	}: UpdatePromotionProgramDto): void {
		const currentTimestamp = Date.now();
		const startTimestamp = start_at ? new Date(start_at).getTime() : null;
		const endTimestamp = end_at ? new Date(end_at).getTime() : null;
		if ((startTimestamp && endTimestamp && endTimestamp < currentTimestamp) || startTimestamp > endTimestamp) {
			throw new HttpException(messages.promotionProgram.invalidStartEndDate, HttpStatus.BAD_REQUEST);
		}
		if (promotion_apply_type && !Object.values(PromotionApplyTypeEnum).includes(promotion_apply_type))
			throw new HttpException(messages.promotionProgram.invalidProgram, HttpStatus.BAD_REQUEST);
	}
}
