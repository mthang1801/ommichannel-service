import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AttributeFilterTypeEnum, AttributePurposeEnum, AttributeTypeEnum } from 'src/common/constants/enum';

export class AttributeValueRequest {
	@ApiProperty()
	@IsOptional()
	id: number;

	@ApiProperty()
	@IsOptional()
	@Transform(({ value }) => (value ? value.trim() : value))
	value: string;

	@ApiProperty()
	@IsNotEmpty()
	@Transform(({ value }) => (value ? value.trim() : value))
	value_name: string;

	@ApiProperty()
	@IsOptional()
	value_code: string;

	@ApiProperty()
	@IsOptional()
	index: number;
}

export class UpdateAttributeDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	attribute_code?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	attribute_name?: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ApiProperty()
	@IsOptional()
	@IsEnum(AttributePurposeEnum)
	purposes: AttributePurposeEnum;

	@ApiProperty()
	@IsOptional()
	@IsEnum(AttributeTypeEnum)
	attribute_type: AttributeTypeEnum;

	@IsOptional()
	@ApiProperty()
	@IsEnum(AttributeFilterTypeEnum)
	filter_type: AttributeFilterTypeEnum;

	@ApiProperty()
	@IsOptional()
	@IsArray()
	@ValidateNested()
	@Type(() => AttributeValueRequest)
	updated_values: AttributeValueRequest[] = [];

	@IsOptional()
	@IsArray()
	removed_values: number[] = [];
}
