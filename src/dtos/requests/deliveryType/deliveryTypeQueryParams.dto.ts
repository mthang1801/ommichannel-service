import { IsOptional } from 'class-validator';

export class DeliveryTypeQueryParamsDto {
	@IsOptional()
	q: string;

	@IsOptional()
	status: boolean;
}
