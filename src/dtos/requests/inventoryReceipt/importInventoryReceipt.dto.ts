import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class ImportInventoryReceiptDto {
	@IsNotEmpty()
	warehouse: string;

	@IsNotEmpty()
	@IsNumber()
	inventory_staff: string;

	@IsOptional()
	@IsString()
	note: string;

	@IsOptional()
	@IsNumber()
	status: number;

	@IsOptional()
	@IsString()
	inventory_at: string;

	@IsOptional()
	products: string;
}

class InventoryReceiptDetail {
	@IsNotEmpty()
	@IsString()
	sku: string;

	@IsNotEmpty()
	@IsNumber()
	qty_in_stock: number;

	@IsOptional()
	@IsNumber()
	real_qty_in_stock: number;

	@IsOptional()
	@IsNumber()
	differential: number;
}
