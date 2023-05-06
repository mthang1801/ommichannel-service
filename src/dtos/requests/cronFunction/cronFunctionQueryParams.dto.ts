import { IsOptional } from 'class-validator';

export class CronFunctionQueryParamsDto {
	@IsOptional()
	page: number;

	@IsOptional()
	limit: number;

	@IsOptional()
	q: string;

	@IsOptional()
	platform_id: number;

	@IsOptional()
	data_type_id: number;

	@IsOptional()
	status: string;
}
