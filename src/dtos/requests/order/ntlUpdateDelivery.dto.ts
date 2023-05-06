import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class NTLUpdateDeliveryDto {
	@ApiProperty()
	@IsOptional()
	bill_no: string;

	@ApiProperty()
	@IsOptional()
	ref_code: string;

	@ApiProperty()
	@IsOptional()
	status_id: number;

	@ApiProperty()
	@IsOptional()
	status_name: string;

	@ApiProperty()
	@IsOptional()	
	status_time: number;

	@ApiProperty()
	@IsOptional()	
	push_time: number;

	@ApiProperty()
	@IsOptional()
	partial: string;

	@ApiProperty()
	@IsOptional()
	shipping_fee: number;

	@ApiProperty()
	@IsOptional()
	weight: number;

	@ApiProperty()
	@IsOptional()
	reason: string;

	@ApiProperty()
	@IsOptional()
	dimension_weight: number;
}
