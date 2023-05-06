import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class InventoryReceiptQueryParamsDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	page = 1;

	@ApiProperty({ example: 10 })
	@IsOptional()
	limit = 10;

	@IsOptional()
	q: string;

	@IsOptional()
	warehouse_id: number;

	@IsOptional()
	status: number;

	@IsOptional()
	from_created_date: string;

	@IsOptional()
	to_created_date: string;

	@IsOptional()
	from_inventory_date: string;

	@IsOptional()
	to_inventory_date: string;

	@IsOptional()
	from_completed_date: string;

	@IsOptional()
	to_completed_date: string;
}
