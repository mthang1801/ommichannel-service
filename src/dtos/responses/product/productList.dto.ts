import { ApiProperty } from '@nestjs/swagger';
import { ProductLevelEnum, ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';

export class ProductListDto {
	@ApiProperty()
	'id': number;
	@ApiProperty()
	'seller_id': number;
	@ApiProperty()
	'parent_id': number;
	@ApiProperty()
	'product_name': string;
	@ApiProperty()
	'sku': string;
	@ApiProperty()
	'barcode': string;
	@ApiProperty()
	'product_name_vat': string;
	@ApiProperty()
	'sku_vat': string;
	@ApiProperty()
	'vat': string;
	@ApiProperty()
	'status': boolean;
	@ApiProperty()
	'catalog_id': number;
	@ApiProperty({ enum: ProductStatusEnum })
	'product_status': ProductStatusEnum;
	@ApiProperty({ enum: ProductTypeEnum })
	'product_type': ProductTypeEnum;
	@ApiProperty({ enum: ProductLevelEnum })
	'product_level': ProductLevelEnum;
	@ApiProperty()
	'virtual_stock_quantity': number;
	@ApiProperty()
	'retail_price': number;
	@ApiProperty()
	'wholesale_price': number;
	@ApiProperty()
	'listed_price': number;
	@ApiProperty()
	'return_price': number;
	@ApiProperty()
	'import_price': number;
	@ApiProperty()
	'allow_installment': boolean;
	@ApiProperty()
	'description': string;
	@ApiProperty()
	'short_description': string;
	@ApiProperty()
	'other_info': string;
	@ApiProperty()
	'promotion_info': string;
	@ApiProperty()
	'video_url': string;
	@ApiProperty()
	'thumbnail': string;
	@ApiProperty()
	'meta_title': string;
	@ApiProperty()
	'meta_keywords': string;
	@ApiProperty()
	'meta_image': string;
	@ApiProperty()
	'meta_description': string;
	@ApiProperty()
	'canonical': string;
	@ApiProperty()
	'url': string;
	@ApiProperty()
	'redirect_url': string;
	@ApiProperty()
	'redirect_type': string;
	@ApiProperty()
	'weight': number;
	@ApiProperty()
	'length': number;
	@ApiProperty()
	'width': number;
	@ApiProperty()
	'height': number;
	@ApiProperty()
	'index': number;
	@ApiProperty()
	'warranty_months': number;
	@ApiProperty()
	'warranty_address': string;
	@ApiProperty()
	'warranty_phone': string;
	@ApiProperty()
	'warranty_note': string;
	@ApiProperty()
	'created_by': number;
	@ApiProperty()
	'updated_by': number;
	@ApiProperty()
	'createdAt': Date;
	@ApiProperty()
	'updatedAt': Date;
	@ApiProperty()
	'deletedAt': null;
}
