import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { AttributeValue } from 'src/models/attributeValue.model';
import { ProductAttributeDto } from './productAttribute.dto';
import { ProductVariation } from './productVariation.dto';

export class CreateProductDTO {
	@ApiProperty({ description: 'SKU của SP', example: 'IPHONE-14-PRO-MAX' })
	@IsNotEmpty()
	sku: string;

	@ApiProperty({ description: 'unit Id của SP', example: '1' })
	@IsOptional()
	unit_id: number;

	@ApiProperty({
		description: 'barcode của SP',
		example: 'IPHONE-14-PRO-MAX'
	})
	@IsNotEmpty()
	barcode: string;

	@ApiProperty({
		description: 'Id của SP cấu hình nếu chọn SP con',
		example: 1
	})
	@ApiPropertyOptional()
	@IsOptional()
	parent_id: number;

	@ApiProperty({ description: 'Tên SP', example: 'iphone 14 pro max' })
	@IsNotEmpty()
	product_name: string;

	@ApiProperty({
		description: 'Tên VAT của SP',
		example: 'iphone 14 pro max'
	})
	@ApiPropertyOptional()
	@IsOptional()
	product_name_vat: string;

	@ApiProperty({
		description: 'SKU VAT của SP',
		example: 'IPHONE-14-PRO-MAX'
	})
	@ApiPropertyOptional()
	@IsOptional()
	sku_vat: string;

	@ApiProperty({ description: 'VAT của SP', example: 'IPHONE-14-PRO-MAX' })
	@ApiPropertyOptional()
	@IsOptional()
	vat: string;

	@ApiProperty({
		description: 'Trạng thái hiển thị của SP',
		example: true,
		type: Boolean
	})
	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	status = true;

	@ApiProperty({
		description: 'Tình trạng SP',
		enum: ProductStatusEnum,
		default: ProductStatusEnum.Mới
	})
	@ApiPropertyOptional()
	@IsEnum(ProductStatusEnum)
	@IsOptional()
	product_status: ProductStatusEnum = ProductStatusEnum.Mới;

	@ApiProperty({
		description: 'Loại SP',
		enum: ProductTypeEnum,
		default: ProductTypeEnum.Normal
	})
	@ApiPropertyOptional()
	@IsEnum(ProductTypeEnum)
	@IsOptional()
	product_type: ProductTypeEnum = ProductTypeEnum.Normal;

	@ApiProperty({
		description: 'Ngành hàng của SP'
	})
	@ApiPropertyOptional()
	@IsOptional()
	catalog_id: number;

	@ApiProperty({
		description: 'Ngành hàng của SP'
	})
	@IsOptional()
	virtual_stock_quantity: number;

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
		description: 'Cho phép mua trả góp hay không'
	})
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	allow_installment = true;

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
	redirect_url: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	redirect_type: number;

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

	@ApiProperty({
		type: 'array',
		items: { allOf: [{ $ref: getSchemaPath(ProductVariation) }] },
		example: [
			{
				sku: 'iphone-14-pro-max-gold',
				barcode: 'iphone-14-pro-max-gold',
				product_name: 'iPhone 14 Pro max Gold',
				virtual_stock_quantity: 100,
				attributes: [
					{ attribute_id: 1, value_id: 1 },
					{ attribute_id: 2, value_id: 2 }
				],
				retail_price: 42000000,
				wholesale_price: 42000000,
				listed_price: 42000000,
				return_price: 42000000,
				import_price: 42000000,
				thumbnail: 'thumbnail'
			},
			{
				sku: 'iphone-14-pro-max-Black',
				barcode: 'iphone-14-pro-max-Black',
				product_name: 'iPhone 14 Pro max Black',
				virtual_stock_quantity: 100,
				attributes: [
					{ attribute_id: 1, value_id: 1 },
					{ attribute_id: 2, value_id: 2 }
				],
				retail_price: 43000000,
				wholesale_price: 43000000,
				listed_price: 45000000,
				return_price: 45000000,
				import_price: 45000000,
				thumbnail: 'thumbnail'
			}
		]
	})
	@ApiPropertyOptional()
	@IsOptional()
	@ValidateNested()
	@Type(() => ProductVariation)
	product_variations: ProductVariation[] = [];

	@ApiProperty({ type: [String], example: ['image1', 'image2'] })
	@ApiPropertyOptional()
	@IsOptional()
	image_urls: string[];

	@ApiProperty({
		type: 'array',
		items: {
			oneOf: [{ $ref: getSchemaPath(AttributeValue) }]
		},
		example: [
			{ attribute_id: 1, value_ids: '[1,2,3]', selected_value: 'abc' },
			{ attribute_id: 2, value_ids: '[2,3,4]', selected_value: 'xyz' }
		]
	})
	@ApiPropertyOptional()
	@IsOptional()
	@ValidateNested()
	@Type(() => ProductAttributeDto)
	attributes: ProductAttributeDto[] = [];

	@ApiPropertyOptional({
		example: [1, 2, 3],
		description: 'danh sách danh mục'
	})
	@IsOptional()
	categories_list: number[] = [];
}
