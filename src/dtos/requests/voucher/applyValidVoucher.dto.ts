import { IsNumber, IsOptional } from 'class-validator';

export class ApplyValidVoucherDto {
	@IsOptional()
	@IsNumber()
	total_price: number;
}
