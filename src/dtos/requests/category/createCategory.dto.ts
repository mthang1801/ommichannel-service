import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
	@ApiProperty({ example: 'Điện thoại' })
	@IsNotEmpty()
	@IsString()
	category_name: string;

	@ApiProperty({ example: 'Danh mục điện thoại' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description: string;
	
	@ApiProperty({ example: 'Hình ảnh Danh mục điện thoại' })
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
}
