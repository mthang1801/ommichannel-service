import { IsOptional } from 'class-validator';

export class OrderStatusQueryParamsDto {
	@IsOptional()
	q: string;
}
