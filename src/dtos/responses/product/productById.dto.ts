import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ProductLevelEnum, ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { ProductVariation } from 'src/dtos/requests/products/productVariation.dto';
import { AttributeValue } from 'src/models/attributeValue.model';
import { ProductAttribute } from 'src/models/productAttribute.model';
import { Seller } from 'src/models/seller.model';
import { User } from 'src/models/user.model';
import { ProductAttributesListDto } from './poductAttributesList.dto';

export class ProductByIdResponseDto {
	@ApiProperty()
	seller_id: number;

	@ApiProperty()
	parent_id: number;

	@ApiProperty({ type: Seller })
	seller: Seller;

	@ApiProperty()
	product_name: string;

	@ApiProperty()
	sku: string;

	@ApiProperty()
	barcode: string;

	@ApiProperty()
	product_name_vat: string;

	@ApiProperty()
	sku_vat: string;

	@ApiProperty()
	vat: string;

	@ApiProperty()
	status: boolean;

	@ApiProperty()
	catalog_id: number;

	@ApiProperty({ enum: ProductStatusEnum, default: ProductStatusEnum.Mới })
	product_status: ProductStatusEnum;

	@ApiProperty({ enum: ProductTypeEnum, default: ProductTypeEnum.Normal })
	product_type: ProductTypeEnum;

	@ApiProperty({
		enum: ProductLevelEnum,
		default: ProductLevelEnum.Independence
	})
	product_level: ProductLevelEnum;

	@ApiProperty()
	virtual_stock_quantity: number;

	@ApiProperty()
	retail_price: number;

	@ApiProperty()
	wholesale_price: number;

	@ApiProperty()
	listed_price: number;

	@ApiProperty()
	return_price: number;

	@ApiProperty()
	import_price: number;

	@ApiProperty()
	allow_installment: boolean;

	@ApiProperty()
	description: string;

	@ApiProperty()
	short_description: string;

	@ApiProperty()
	other_info: string;

	@ApiProperty()
	promotion_info: string;

	@ApiProperty()
	video_url: string;

	@ApiProperty()
	thumbnail: string;

	@ApiProperty()
	meta_title: string;

	@ApiProperty()
	meta_keywords: string;

	@ApiProperty()
	meta_image: string;

	@ApiProperty()
	meta_description: string;

	@ApiProperty()
	canonical: string;

	@ApiProperty()
	url: string;

	@ApiProperty()
	redirect_url: string;

	@ApiProperty()
	redirect_type: number;

	@ApiProperty()
	weight: number;

	@ApiProperty()
	length: number;

	@ApiProperty()
	width: number;

	@ApiProperty()
	height: number;

	@ApiProperty()
	index: number;

	@ApiProperty()
	warranty_months: number;

	@ApiProperty()
	warranty_address: string;

	@ApiProperty()
	warranty_phone: string;

	@ApiProperty()
	warranty_note: string;

	@ApiProperty()
	@ApiProperty()
	created_by: number;

	@ApiProperty({ type: User })
	creator: User;

	@ApiProperty()
	@ApiProperty()
	updated_by: number;

	@ApiProperty()
	updater: User;

	@ApiProperty({
		type: 'array',
		items: {
			oneOf: [{ $ref: getSchemaPath(AttributeValue) }]
		},
		example: [
			{ attribute_id: 1, value_id: 1 },
			{ attribute_id: 2, value_id: 2 }
		]
	})
	attributes: ProductAttribute[];

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
				thumbnail: 'thumbnail',
				index: 0
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
				thumbnail: 'thumbnail',
				index: 1
			}
		]
	})
	product_variations: ProductVariation[];

	@ApiProperty({
		type: ProductAttributesListDto,
		example: [
			{
				attribute_id: '6',
				values: [
					{
						id: 1,
						product_id: 22,
						attribute_id: 6,
						value_id: 22,
						value: 'cam',
						attribute_code: 'color',
						attribute_name: 'Màu sắc'
					},
					{
						id: 2,
						product_id: 23,
						attribute_id: 6,
						value_id: 23,
						value: 'vàng',
						attribute_code: 'color',
						attribute_name: 'Màu sắc'
					}
				]
			}
		]
	})
	variationAttributesList: ProductAttributesListDto[];
}
