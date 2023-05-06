import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DeliveryStatusDto {
	@ApiPropertyOptional({ description: 'Tổng Tiền Chờ đóng gói' })
	@IsOptional()
	waitingPackingAmount: number;

	@ApiPropertyOptional({ description: 'SL Chờ đóng gói' })
	@IsOptional()
	waitingPackingCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Đã đóng gói' })
	@IsOptional()
	packagedAmount: number;

	@ApiPropertyOptional({ description: 'Số lượng Đã đóng gói' })
	@IsOptional()
	packagedCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Chờ lấy hàng' })
	@IsOptional()
	waitingPickingUpAmount: number;

	@ApiPropertyOptional({ description: 'SL Chờ lấy hàng' })
	@IsOptional()
	waitingPickingUpCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Đang vận chuyển' })
	@IsOptional()
	transportingAmount: number;

	@ApiPropertyOptional({ description: 'SL Đang vận chuyển' })
	@IsOptional()
	transportingCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Đang giao hàng' })
	@IsOptional()
	deliveryAmount: number;

	@ApiPropertyOptional({ description: 'SL Đang giao hàng' })
	@IsOptional()
	deliveryCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Giao thành công' })
	@IsOptional()
	deliverySuccessAmount: number;

	@ApiPropertyOptional({ description: 'SL Giao thành công' })
	@IsOptional()
	deliverySuccessCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Giao lỗi' })
	@IsOptional()
	deliveryFailAmount: number;

	@ApiPropertyOptional({ description: 'SL Giao lỗi' })
	@IsOptional()
	deliveryFailCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Chờ giao lại' })
	@IsOptional()
	waitingDeliveryAgainAmount: number;

	@ApiPropertyOptional({ description: 'SL Chờ giao lại' })
	@IsOptional()
	waitingDeliveryAgainCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền chuyển hoàn' })
	@IsOptional()
	returningAmount: number;

	@ApiPropertyOptional({ description: 'SL chuyển hoàn' })
	@IsOptional()
	returningCount: number;

	@ApiPropertyOptional({ description: 'Tổng tiền Đã chuyển hoàn' })
	@IsOptional()
	returnedAmount: number;

	@ApiPropertyOptional({ description: 'SL Đã chuyển hoàn' })
	@IsOptional()
	returnedCount: number;
}
