import { IsOptional } from 'class-validator';

export class CodAndCarriageBillQueryParamsDto {
	@IsOptional()
	page: number;

	@IsOptional()
	limit: number;

	@IsOptional()
	q: string;

	@IsOptional()
	shipping_unit_id: number;

	@IsOptional()
	for_control_status: number;

	@IsOptional()
	payment_status: number;

	@IsOptional()
	from_date: string;

	@IsOptional()
	to_date: string;
}
