import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { HttpMethodsEnum, ModuleFunctionActionTypesEnum } from 'src/common/constants/enum';
import { filterData } from 'src/utils/functions.utils';

export class UpdateFunctDto {
	@IsOptional()
	@IsString()
	@Transform(({ value }) => value.toUpperCase())
	@IsEnum(HttpMethodsEnum)
	method: string;

	@IsOptional()
	@IsNumber()
	parent_id: number;

	@IsOptional()
	@IsString()
	api_route: string;

	@IsOptional()
	@IsString()
	ui_route: string;

	@IsOptional()
	@IsString()
	mobile_route: string;

	@IsOptional()
	@IsNumber()
	index: number;

	@IsString()
	@IsOptional()
	@Transform(({ value }) => value.trim())
	funct_name: string;

	@IsString()
	@IsOptional()
	@Transform(({ value }) => value.trim())
	funct_code: string;

	@IsString()
	@IsOptional()
	ui_icon: string;

	@IsString()
	@IsOptional()
	mobile_icon: string;

	@IsString()
	@IsOptional()
	active_icon: string;

	@IsOptional()
	@IsEnum(ModuleFunctionActionTypesEnum)
	action: ModuleFunctionActionTypesEnum;

	@IsString()
	@IsOptional()
	description: string;

	@IsOptional()
	relative_funct_ids: number[];

	@IsOptional()
	@IsBoolean()
	status: boolean;

	@IsOptional()
	@IsNumber()
	level;

	constructor(data: Partial<UpdateFunctDto>) {
		const result = filterData(data);
		Object.assign(this, result);
	}
}
