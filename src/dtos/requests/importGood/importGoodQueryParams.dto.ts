import { IsOptional } from 'class-validator';

export class ImportGoodQueryParamsDto {
	@IsOptional()
	page: number;

	@IsOptional()
	limit: number;

	@IsOptional()
	q: string;

	@IsOptional()
	supplier_id: number;

	@IsOptional()
	payment_status: number;

	@IsOptional()
	input_status: number;

	@IsOptional()
	from_date: string;

	@IsOptional()
	to_date: string;

	@IsOptional()
	transaction_status: number;
}
