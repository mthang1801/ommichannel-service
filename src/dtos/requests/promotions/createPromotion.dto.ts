import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { PromotionApplyMethodType } from 'src/common/constants/constant';
import {
	CustomerRankingEnum,
	PlatformEnum,
	PromotionApplyTypeEnum,
	PromotionStatusEnum
} from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { createFilterSeperator } from 'src/utils/functions.utils';
import { PromotionEntityDto } from './promotionEntity.dto';

export class CreatePromotionDto {
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
	status: number = PromotionStatusEnum['Chưa kích hoạt'];

	@ApiPropertyOptional({ description: 'Số lượng KM tối đa' })
	@IsOptional()
	max_use_quantity: number;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@IsOptional()
	start_date: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@IsOptional()
	end_date: string;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@IsOptional()
	start_at: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@IsOptional()
	end_at: string;

	@ApiPropertyOptional({ description: 'Thứ trong tuần' })
	@IsOptional()
	days_of_week: number[];

	@ApiPropertyOptional({ description: 'Tháng trong năm' })
	@IsOptional()
	months_of_year: number[];

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@IsOptional()
	days_of_month: number[];

	@ApiPropertyOptional({ description: 'Bao gồm các ngày' })
	@IsOptional()
	include_dates: string[];

	@ApiPropertyOptional({ description: 'Không Bao gồm các ngày' })
	@IsOptional()
	not_include_dates: string[];

	@ApiPropertyOptional({
		description: `áp dụng cho ${Object.entries(PromotionApplyTypeEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@IsOptional()
	@IsNumber()
	apply_method: number;

	@ApiPropertyOptional({
		description: `đối tượng KH áp dụng ${Object.entries(CustomerRankingEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@IsOptional()
	customer_rankings: number[];

	@ApiPropertyOptional({
		description: `Nguồn đơn áp dụng ${Object.entries(PlatformEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@IsOptional()
	@Transform(({ value }) => createFilterSeperator(value))
	utm_sources: number[];

	@ApiPropertyOptional({ description: 'SP hoặc danh mục áp dụng cho chương trình' })
	@IsOptional()
	@ValidateNested()
	@Type(() => PromotionEntityDto)
	entities: PromotionEntityDto[];

	static checkPromotionProgramDataVadidation({ start_at, end_at, apply_method }: CreatePromotionDto): void {
		const currentTimestamp = Date.now();
		const startTimestamp = start_at ? new Date(start_at).getTime() : null;
		const endTimestamp = end_at ? new Date(end_at).getTime() : null;
		if ((startTimestamp && endTimestamp && endTimestamp < currentTimestamp) || startTimestamp > endTimestamp) {
			throw new HttpException(messages.promotionProgram.invalidStartEndDate, HttpStatus.BAD_REQUEST);
		}
		if (!Object.values(PromotionApplyMethodType).includes(apply_method))
			throw new HttpException(messages.promotionProgram.invalidProgram, HttpStatus.BAD_REQUEST);
	}
}
