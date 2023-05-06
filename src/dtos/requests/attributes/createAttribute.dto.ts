import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsBoolean, isEnum, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttributeFilterTypeEnum, AttributePurposeEnum, AttributeTypeEnum } from 'src/common/constants/enum';
import { AttributeValuesDto } from './attributeValue.dto';
export class CreateAttributeDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	attribute_code: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	attribute_name: string;

	@IsNotEmpty()
	@IsEnum(AttributePurposeEnum)
	purposes: AttributePurposeEnum;

	@IsNotEmpty()
	@IsEnum(AttributeTypeEnum)
	attribute_type: AttributeTypeEnum;

	@IsNotEmpty()
	@IsEnum(AttributeFilterTypeEnum)
	filter_type: AttributeFilterTypeEnum;

	@IsOptional()
	@IsBoolean()
	status: boolean;

	@ArrayNotEmpty()
	values: AttributeValuesDto[];
}
