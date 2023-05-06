import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class InventoryReceiptDetailQueryParamsDto {
	@IsOptional()
	detail_status: number;
}
