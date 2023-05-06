import { IsString, IsNumber, ArrayNotEmpty, IsOptional } from 'class-validator';
export class UpdateGeneralSettingDto {
	@ArrayNotEmpty()
	settings: GeneralSetting[];
}

class GeneralSetting {
	@IsOptional()
	@IsNumber()
	id: number;

	@IsOptional()
	@IsString()
	obj_value: string;
}
