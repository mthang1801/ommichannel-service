import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateOrderStatusDto {
	@ApiProperty({ type: [Number], example: [1, 2, 3, 4] })
	@ArrayNotEmpty()
	ids: number[];

	@ApiProperty({ type: Number, example: 1, description: 'Trạng thái của đơn hiện tại' })
	@IsNotEmpty()
	@IsNumber()
	current_order_status_id: number;

	@ApiProperty({ type: Number, example: 1, description: 'Trạng thái của đơn cần cập nhật' })
	@IsNotEmpty()
	@IsNumber()
	target_order_status_id: number;
}
