import { IsNotEmpty, IsOptional } from 'class-validator';

export class BankBranchQueryParamsDto {
	@IsOptional()
	page: number;

	@IsOptional()
	limit: number;

	@IsOptional()
	q: string;

	@IsNotEmpty()
	bank_code: string;
}
