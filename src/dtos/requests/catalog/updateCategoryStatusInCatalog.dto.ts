import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCategoryStatusInCatalogDto {
	@IsNotEmpty()
	@IsBoolean()
	status: boolean;
}
