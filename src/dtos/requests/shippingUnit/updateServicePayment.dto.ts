import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServicePaymentDto {
	@ApiProperty({ description: 'Hình thức vận chuyển' })
	@IsArray()
	@IsOptional()
	delivery_service_ids: number[] = [];

	@ApiProperty({ description: 'Hình thức thanh toán' })
	@IsArray()
	@IsOptional()
	payment_method_ids: number[] = [];
}
