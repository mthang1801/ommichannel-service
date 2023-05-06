import { IsOptional } from 'class-validator';

export class ProvinceQueryParamsDto {
	@IsOptional()
	q: string;
}
