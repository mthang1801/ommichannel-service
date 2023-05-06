import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectShippingUnitDto {
	@ApiProperty({ description: 'Username, password, token...' })
	@IsNotEmpty()
	@IsString()
	data: string;

	@ApiProperty({ description: 'Hình thức vận chuyển' })
	@IsArray()
	@IsOptional()
	delivery_service_ids: number[] = [];

	@ApiProperty({ description: 'Hình thức thanh toán' })
	@IsArray()
	@IsOptional()
	payment_method_ids: number[] = [];
}
