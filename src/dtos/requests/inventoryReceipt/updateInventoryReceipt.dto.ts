import { ArrayNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateInventoryReceiptDto {
	@IsOptional()
	@IsNumber()
	status: number;

	@ArrayNotEmpty()
	details: InventoryReceiptDetail[];

	@IsOptional()
	more_details: MoreInventoryReceiptDetail[];
}

class InventoryReceiptDetail {
	@IsNotEmpty()
	@IsNumber()
	product_id: number;

	@IsNotEmpty()
	@IsNumber()
	real_qty_in_stock: number;
}

class MoreInventoryReceiptDetail {
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
