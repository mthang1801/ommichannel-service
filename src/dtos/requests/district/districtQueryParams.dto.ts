import { IsOptional } from 'class-validator';

export class DistrictQueryParamsDto {
	@IsOptional()
	q: string;

	@IsOptional()
	province_id: number;
}
