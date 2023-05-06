import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class OrderQueryParamDto {
	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	q: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	order_status_id: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	platform_id: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	payment_status: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	payment_method_id: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsNumber()
	customer_id: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsDateString()
	from_date: Date;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsDateString()
	to_date: Date;
}
