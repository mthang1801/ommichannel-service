import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectToNTLDto {
	@ApiProperty({ description: 'customer' })
	@IsNotEmpty()
	@IsString()
	username: string;

	@ApiProperty({ description: '123455' })
	@IsNotEmpty()
	@IsString()
	password: string;

	@ApiProperty({ description: 'Hình thức vận chuyển' })
	@IsArray()
	@IsOptional()
	delivery_service_ids: number[] = [];

	@ApiProperty({ description: 'Hình thức thanh toán' })
	@IsArray()
	@IsOptional()
	payment_method_ids: number[] = [];
}
