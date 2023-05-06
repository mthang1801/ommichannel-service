import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateInventoryReceiptDto {
	@IsNotEmpty()
	@IsNumber()
	warehouse_id: number;

	@IsNotEmpty()
	@IsNumber()
	inventory_staff_id: number;

	@IsOptional()
	@IsString()
	note: string;

	@IsOptional()
	@IsNumber()
	status: number;

	@IsOptional()
	@IsString()
	inventory_at: string;

	@ArrayNotEmpty()
	details: InventoryReceiptDetail[];
}

class InventoryReceiptDetail {
	@IsNotEmpty()
	@IsString()
	sku: string;

	@IsNotEmpty()
	@IsNumber()
	product_id: number;

	@IsNotEmpty()
	@IsString()
	product: string;

	@IsNotEmpty()
	@IsNumber()
	qty_in_stock: number;

	@IsOptional()
	@IsNumber()
	real_qty_in_stock: number;

	@IsOptional()
	@IsNumber()
	differential: number;

	@IsNotEmpty()
	@IsNumber()
	unit_id: number;
}
