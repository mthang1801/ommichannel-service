import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PromotionApplyTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';

export class CreatePromotionProgramDto {
	@ApiProperty({ description: 'Tên chương trình' })
	@IsNotEmpty()
	program_name: string;

	@ApiProperty({ description: 'Mã chương trình' })
	@IsNotEmpty()
	@Transform(({ value }) => value.trim().toUpperCase())
	program_code: string;

	@ApiPropertyOptional({ description: 'Mô tả chương trình' })
	@IsOptional()
	description: string;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@IsOptional()
	status: boolean;

	@ApiPropertyOptional({ description: 'Giới hạn Số lượng' })
	@IsOptional()
	max_use_quantity: number;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@IsOptional()
	@Transform(({value}) => `${value} 00:00:00`)
	start_at: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@IsOptional()
	@Transform(({value}) => `${value} 23:59:59`)
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
	min_price_from: number = 0;

	@ApiPropertyOptional({ description: 'SP hoặc danh mục áp dụng cho chương trình' })
	@IsOptional()
	promotion_entity_ids : number[];

	@ApiPropertyOptional({ description: 'Áp dụng cho tất cả' })
	@IsOptional()
	apply_all_products : boolean;

	static checkPromotionProgramDataVadidation({ start_at, end_at, promotion_apply_type }: CreatePromotionProgramDto): void {
		const currentTimestamp = Date.now();
		const startTimestamp = start_at ? new Date(start_at).getTime() : null;
		const endTimestamp = end_at ? new Date(end_at).getTime() : null;

		if ((startTimestamp && endTimestamp && endTimestamp < currentTimestamp) || startTimestamp > endTimestamp) {
			throw new HttpException(messages.promotionProgram.invalidStartEndDate, HttpStatus.BAD_REQUEST);
		}

		if (!Object.values(PromotionApplyTypeEnum).includes(promotion_apply_type))
			throw new HttpException(messages.promotionProgram.invalidProgram, HttpStatus.BAD_REQUEST);
	}


}
