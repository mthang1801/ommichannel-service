import { IsOptional } from 'class-validator';

export class WardQueryParamsDto {
	@IsOptional()
	q: string;

	@IsOptional()
	district_id: number;
}
