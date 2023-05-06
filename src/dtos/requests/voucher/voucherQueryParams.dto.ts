import { IsOptional } from 'class-validator';

export class VoucherQueryParamsDto {
	@IsOptional()
	q: string;
}
