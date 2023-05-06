import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { parseDataSqlizeResponse } from '../../../utils/functions.utils';

export class CategoryAttributeDto {
	@ApiPropertyOptional()
	@IsNotEmpty()
	attribute_id: number;

	@ApiPropertyOptional()
	@IsNotEmpty()
	category_id: number;

	@ApiPropertyOptional()
	@IsNotEmpty()
	status: number;
}

export class UpdateCategoryDto {
	@ApiProperty({ example: 'Điện thoại' })
	@IsOptional()
	@IsString()
	category_name: string;

	@ApiProperty({ example: 'Danh mục điện thoại' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty({ example: 'Danh mục điện thoại' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	category_image: string;

	@ApiProperty({ example: 'dien-thoai' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	url: string;

	@ApiProperty({ example: true })
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	status = true;

	@ApiProperty({ example: 5 })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	parent_id: number;

	@ApiProperty({ example: 'Điện thoại' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	meta_title: string;

	@ApiProperty({ example: 'Mô tả điện thoại iPhone14' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	meta_description: string;

	@ApiProperty({ example: 'dien thoai; iphone 14' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	meta_keywords: string;

	@ApiProperty({ example: 'https://ntlogistics.vn' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	canonical: string;

	@ApiProperty({ example: 'file/dien-thoai.png' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	meta_image: string;

	@ApiProperty({ example: 'redirect_url' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	redirect_url: string;

	@ApiProperty({ example: 300 })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	redirect_type: number;

	@ApiProperty()
	@IsOptional()		
	@Transform(({ value }: any) => {
		const result = value.map((attributeItem: any) => {
			const attribute = parseDataSqlizeResponse(attributeItem);
			return {
				category_id: attribute?.CategoryAttribute?.category_id,
				attribute_id: attribute?.CategoryAttribute?.attribute_id,
				status: attribute?.status
			};
		});
		return result;
	})
	attributes: any[];
}
