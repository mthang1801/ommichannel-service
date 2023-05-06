import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DeliveryReportItemDto {
	@ApiPropertyOptional({ description: 'Tổng tiền Hôm nay' })
	@IsOptional()
	totalAmount0: number;

	@ApiPropertyOptional({ description: 'Tổng đơn Hôm nay' })
	@IsOptional()
	totalCount0: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Hôm trước' })
	@IsOptional()
	totalAmount1: number;

	@ApiPropertyOptional({ description: 'Tổng đơn hôm trước' })
	@IsOptional()
	totalCount1: number;

	@ApiPropertyOptional({ description: 'Tổng tiền 2 ngày trước' })
	@IsOptional()
	totalAmount2: number;

	@ApiPropertyOptional({ description: 'Tổng đơn 2 ngày trước' })
	@IsOptional()
	totalCount2: number;

	@ApiPropertyOptional({ description: 'Tổng tiền 3 ngày trước' })
	@IsOptional()
	totalAmount3: number;

	@ApiPropertyOptional({ description: 'Tổng đơn 3 ngày trước' })
	@IsOptional()
	totalCount3: number;

	@ApiPropertyOptional({ description: 'Tổng tiền 4 ngày trước' })
	@IsOptional()
	totalAmount4: number;

	@ApiPropertyOptional({ description: 'Tổng đơn 4 ngày trước' })
	@IsOptional()
	totalCount4: number;

	@ApiPropertyOptional({ description: 'Tổng tiền 5 ngày trước' })
	@IsOptional()
	totalAmount5: number;

	@ApiPropertyOptional({ description: 'Tổng đơn 5 ngày trước' })
	@IsOptional()
	totalCount5: number;

	@ApiPropertyOptional({ description: 'Tổng tiền 6 ngày trước' })
	@IsOptional()
	totalAmount6: number;

	@ApiPropertyOptional({ description: 'Tổng đơn 6 ngày trước' })
	@IsOptional()
	totalCount6: number;
}

export class DeliveryReportElementDto {
	@ApiPropertyOptional({ description: 'Tổng tiền' })
	@IsOptional()
	totalAmount: number;

	@ApiPropertyOptional({ description: 'Tổng đơn' })
	@IsOptional()
	totalCount: number;
}

export class DeliveryReportDto {
	@ApiPropertyOptional({ description: 'Report for NTL' })
	@IsOptional()
	NTL: DeliveryReportItemDto;

	@ApiPropertyOptional({ description: 'Report for NTX' })
	@IsOptional()
	NTX: DeliveryReportItemDto;
}
