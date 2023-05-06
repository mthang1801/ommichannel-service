import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateImportGoodDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	import_good_code: string;

	@IsNotEmpty()
	@IsNumber()
	supplier_id: number;

	@IsOptional()
	@IsNumber()
	warehouse_id: number;

	@IsOptional()
	@IsNumber()
	payment_method: number;

	@IsOptional()
	@IsString()
	payment_code: string;

	@IsOptional()
	@IsNumber()
	total_amount: number;

	@IsOptional()
	@IsNumber()
	paid_amount: number;

	@IsOptional()
	@IsNumber()
	debit_amount: number;

	@IsOptional()
	@IsString()
	payment_by: string;

	@IsOptional()
	@IsString()
	payment_at: string;

	@IsOptional()
	@IsNumber()
	input_status: number;

	@IsOptional()
	@IsString()
	input_by: string;

	@IsOptional()
	@IsString()
	input_at: string;

	@IsOptional()
	@IsNumber()
	payment_status: number;

	@ArrayNotEmpty()
	details: ImportGoodDetail[];
}

class ImportGoodDetail {
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
	qty: number;

	@IsOptional()
	@IsNumber()
	unit_id: number;

	@IsNotEmpty()
	@IsNumber()
	price: number;
}
