import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OrderReportStatusesDto {
	@ApiPropertyOptional({ example: 10, description: 'Đếm số lượng đơn Chờ xử lý' })
	@IsOptional()
	inProgressCount: number;

	@ApiPropertyOptional({ example: 1000000, description: 'tổng tiền đơn Chờ xử lý' })
	@IsOptional()
	inProgressAmount: number;

	@ApiPropertyOptional({ example: 20, description: 'Đếm số lượng đơn Đã xác nhận' })
	@IsOptional()
	confirmedCount: number;

	@ApiPropertyOptional({ example: 2000000, description: 'tổng tiền đơn Đã xác nhận' })
	@IsOptional()
	confirmedAmount: number;

	@ApiPropertyOptional({ example: 20, description: 'Đếm số lượng đơn Đã xác nhận và thanh toán thành công' })
	@IsOptional()
	confirmedAndPaymentSuccessCount: number;

	@ApiPropertyOptional({ example: 2000000, description: 'tổng tiền đơn Đã xác nhận và thanh toán thành công' })
	@IsOptional()
	confirmedPaymentSuccessAmount: number;

	@ApiPropertyOptional({ example: 30, description: 'tổng tiền đơn Đóng gói' })
	@IsOptional()
	packageCount: number;

	@ApiPropertyOptional({ example: 3000000, description: 'tổng tiền đơn Đóng gói' })
	@IsOptional()
	packageAmount: number;

	@ApiPropertyOptional({ example: 40, description: 'Đếm số lượng đơn Giao hàng' })
	@IsOptional()
	shippingCount: number;

	@ApiPropertyOptional({ example: 4000000, description: 'Tổng tiền đơn Giao hàng' })
	@IsOptional()
	shippingAmount: number;

	@ApiPropertyOptional({ example: 40, description: 'Đếm số lượng đơn Chuyển hoàn' })
	@IsOptional()
	failShipCount: number;

	@ApiPropertyOptional({ example: 5000000, description: 'tổng tiền đơn Chuyển hoàn' })
	@IsOptional()
	failShipAmount: number;

	@ApiPropertyOptional({ example: 40, description: 'Đếm số lượng đơn Hoàn thành' })
	@IsOptional()
	completedCount: number;

	@ApiPropertyOptional({ example: 8900000, description: 'Tổng tiền đơn Hoàn thành' })
	@IsOptional()
	completedAmount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn mới' })
	@IsOptional()
	newOrderCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn thanh toán thất bại' })
	@IsOptional()
	failPaymentCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn thanh toán thành công' })
	@IsOptional()
	successPaymentCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn Chờ đóng gói' })
	@IsOptional()
	waitingPackagedCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn đã đóng gói' })
	@IsOptional()
	packagedCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn chờ lấy hàng' })
	@IsOptional()
	waitingForGoodsCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn đang vận chuyển' })
	@IsOptional()
	transportingCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn đang giao hàng' })
	@IsOptional()
	deliveryCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn giao thành công' })
	@IsOptional()
	successfulDeliveryCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn lỗi giao hàng' })
	@IsOptional()
	errorDeliveryCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn chờ giao lại' })
	@IsOptional()
	waitingDeliveryAgainCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn đang chuyển hoàn' })
	@IsOptional()
	movingBackCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Số lượng đơn đã chuyển hoàn' })
	@IsOptional()
	movedBackCount: number;

	@ApiPropertyOptional({ example: 10, description: 'Chờ giao lại' })
	@IsOptional()
	waitingDeliveryAgain: number;
}
