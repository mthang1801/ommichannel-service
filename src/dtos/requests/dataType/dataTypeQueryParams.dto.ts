import { IsOptional } from 'class-validator';

export class DataTypeQueryParamsDto {
	@IsOptional()
	q: string;
}
