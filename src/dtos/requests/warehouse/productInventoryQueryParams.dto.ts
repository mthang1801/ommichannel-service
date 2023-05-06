import { IsOptional } from 'class-validator';

export class ProductInventoryQueryParamsDto {
	@IsOptional()
	q: string;
}
