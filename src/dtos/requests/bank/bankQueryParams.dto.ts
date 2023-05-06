import { IsOptional } from 'class-validator';

export class BankQueryParamsDto {
	@IsOptional()
	page: number;

	@IsOptional()
	limit: number;

	@IsOptional()
	q: string;
}
