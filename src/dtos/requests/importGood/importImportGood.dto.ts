import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class ImportImportGoodDto {
	@IsOptional()
	products: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	import_good_code: string;

	@IsOptional()
	supplier: string;

	@IsOptional()
	warehouse: string;

	@IsOptional()
	payment_method: string;

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

	@IsOptional()
	details: ImportGoodDetail[];
}

class ImportGoodDetail {
	@IsNotEmpty()
	@IsString()
	sku: string;

	@IsNotEmpty()
	@IsNumber()
	qty: number;

	@IsNotEmpty()
	@IsNumber()
	price: number;
}
