import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidateIf } from 'class-validator';
import { HttpMethodsEnum } from 'src/common/constants/enum';
import { FunctCodeValidate } from 'src/common/validations/functCodeValidation';
import { ModuleFunctionActionTypesEnum } from '../../../common/constants/enum';

export class CreateFunctDto {
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.toUpperCase())
	@IsEnum(HttpMethodsEnum)
	method: string;

	@IsOptional()
	@IsNumber()
	parent_id: number = null;

	@IsOptional()
	@IsString()
	api_route: string;

	@IsOptional()
	@IsString()
	ui_route: string;

	@IsOptional()
	@IsString()
	mobile_route: string;

	@IsNumber()
	@IsOptional()
	index: number;

	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => value.trim())
	funct_name: string;

	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => value.trim())
	@Validate(FunctCodeValidate)
	funct_code: string;

	@IsString()
	@IsOptional()
	ui_icon: string;

	@IsString()
	@IsOptional()
	active_icon: string;

	@IsString()
	@IsOptional()
	mobile_icon: string;

	@IsString()
	@IsOptional()
	description: string;

	@IsString()
	@IsOptional()
	@IsEnum(ModuleFunctionActionTypesEnum)
	action: ModuleFunctionActionTypesEnum;

	@IsOptional()
	relative_funct_ids: number[] = [];

	@IsBoolean()
	@IsOptional()
	status = true;

	@IsOptional()
	@IsBoolean()
	only_admin_view = false;
}
