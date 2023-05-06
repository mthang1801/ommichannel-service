import { IsOptional } from 'class-validator';

export class WarehouseStaffQueryParamsDto {
	@IsOptional()
	q: string;

	@IsOptional()
	level: number;
}
