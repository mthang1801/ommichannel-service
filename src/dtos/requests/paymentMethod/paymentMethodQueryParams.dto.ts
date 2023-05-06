import { IsOptional } from 'class-validator';

export class PaymentMethodQueryParamsDto {
	@IsOptional()
	q: string;
}
