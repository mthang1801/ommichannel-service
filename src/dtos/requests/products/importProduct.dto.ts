import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class ImportProductDto {
	@ApiProperty({ description: 'SKU của SP', example: 'IPHONE-14-PRO-MAX' })
	@IsNotEmpty()
	sku: string;

	@ApiProperty({
		description: 'barcode của SP',
		example: 'IPHONE-14-PRO-MAX'
	})
	@IsNotEmpty()
	barcode: string;

	@ApiProperty({ description: 'Tên SP', example: 'iphone 14 pro max' })
	@IsNotEmpty()
	product_name: string;

	@ApiProperty({
		description: 'Trạng thái hiển thị của SP',
		example: true,
		type: String
	})
	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	status: string;

	@ApiProperty({
		description: 'Tình trạng SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	product_status: string;

	@ApiProperty({
		description: 'Loại SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	product_type: string;

	@ApiProperty({
		description: 'Ngành hàng của SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	catalog_name: string;

	@ApiProperty({
		description: 'Danh mục của SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	category_name: string;

	@ApiProperty({
		description: 'Giá bán lẻ của SP'
	})
	@IsNotEmpty()
	retail_price: number;

	@ApiProperty({
		description: 'Giá bán sỉ của SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	wholesale_price: number;

	@ApiProperty({
		description: 'Giá niêm yết của SP'
	})
	@IsOptional()
	listed_price: number;

	@ApiProperty({
		description: 'Giá nhập của SP'
	})
	@IsOptional()
	import_price: number;

	@ApiProperty({
		description: 'Giá hoàn trả của SP'
	})
	@IsNotEmpty()
	return_price: number;

	@ApiProperty({
		description: 'Mô tả chi tiết SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	description: string;

	@ApiProperty({
		description: 'Mô tả ngắn SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	short_description: string;

	@ApiProperty({
		description: 'Thông tin khác'
	})
	@ApiPropertyOptional()
	@IsOptional()
	other_info: string;

	@ApiProperty({
		description: 'Thông tin khuyến mãi'
	})
	@ApiPropertyOptional()
	@IsOptional()
	promotion_info: string;

	@ApiProperty({
		description: 'Ghi chú khuyến mãi'
	})
	@ApiPropertyOptional()
	@IsOptional()
	promotion_note: string;

	@ApiProperty({
		description: 'url video của Sp'
	})
	@ApiPropertyOptional()
	@IsOptional()
	video_url: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	thumbnail: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	meta_title: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	meta_keywords: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	meta_image: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	meta_description: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	canonical: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	url: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	weight: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	length: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	width: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	height: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	warranty_months: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	warranty_address: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	warranty_phone: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	warranty_note: string;
}
