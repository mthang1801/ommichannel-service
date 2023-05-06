import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { ProductAttributeDto } from './productAttribute.dto';
import { ProductVariation } from './productVariation.dto';

export class UpdateProductDTO {
	@IsOptional()
	sku: string;

	@IsOptional()
	unit_id: number;

	@IsOptional()
	barcode: string;

	@IsOptional()
	@IsNumber()
	parent_id: number;

	@IsOptional()
	product_name: string;

	@IsOptional()
	product_name_vat: string;

	@IsOptional()
	sku_vat: string;

	@IsOptional()
	var: string;

	@IsBoolean()
	@IsOptional()
	status = true;

	@IsEnum(ProductStatusEnum)
	@IsOptional()
	product_status: ProductStatusEnum;

	@IsEnum(ProductTypeEnum)
	@IsOptional()
	product_type: ProductTypeEnum;

	@IsOptional()
	catalog_id: number;

	@IsOptional()
	@IsNumber()
	virtual_stock_quantity: number;

	@IsOptional()
	@IsNumber()
	retail_price: number;

	@IsOptional()
	@IsNumber()
	wholesale_price: number;

	@IsOptional()
	@IsNumber()
	listed_price: number;

	@IsOptional()
	import_price: number;

	@IsOptional()
	@IsNumber()
	return_price: number;

	@IsOptional()
	@IsBoolean()
	allow_installment: boolean;

	@IsOptional()
	description: string;

	@IsOptional()
	short_description: string;

	@IsOptional()
	other_info: string;

	@IsOptional()
	promotion_info: string;

	@IsOptional()
	promotion_note: string;

	@IsOptional()
	hover_info: string;

	@IsOptional()
	video_url: string;

	@IsOptional()
	thumbnail: string;

	@IsOptional()
	meta_title: string;

	@IsOptional()
	meta_keywords: string;

	@IsOptional()
	meta_image: string;

	@IsOptional()
	meta_description: string;

	@IsOptional()
	canonical: string;

	@IsOptional()
	url: string;

	@IsOptional()
	redirect_url: string;

	@IsNumber()
	@IsOptional()
	redirect_type: number;

	@IsNumber()
	@IsOptional()
	weight: number;

	@IsNumber()
	@IsOptional()
	length: number;

	@IsNumber()
	@IsOptional()
	width: number;

	@IsNumber()
	@IsOptional()
	height: number;

	@IsNumber()
	@IsOptional()
	warranty_months: number;

	@IsOptional()
	warranty_address: string;

	@IsOptional()
	warranty_phone: string;

	@IsOptional()
	warranty_note: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => ProductVariation)
	product_variations: ProductVariation[] = [];

	@IsOptional()
	image_urls: string[];

	@IsOptional()
	@ValidateNested()
	@Type(() => ProductAttributeDto)
	attributes: ProductAttributeDto[];

	@ApiPropertyOptional({
		example: [1, 2, 3],
		description: 'danh sách danh mục'
	})
	@IsOptional()
	categories_list: any;
}
