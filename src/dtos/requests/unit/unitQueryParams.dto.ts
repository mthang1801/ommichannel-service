import { IsOptional } from 'class-validator';

export class UnitQueryParamsDto {
	@IsOptional()
	q: string;
}
