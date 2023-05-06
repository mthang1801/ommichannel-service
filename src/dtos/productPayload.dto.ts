import { ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { ProductVariation } from './requests/products/productVariation.dto';

export class ProductPayload {
	sku?: string;

	parent_id?: number;

	barcode?: string;

	product_name?: string;

	product_name_vat?: string;

	sku_vat?: string;

	var?: string;

	is_active?: string;

	product_status?: ProductStatusEnum;

	product_type?: ProductTypeEnum;

	catalog_id?: number;

	virtual_stock_quantity?: number;

	retail_price?: number;

	wholesale_price?: number;

	listed_price?: number;

	return_price?: number;

	allow_installment = true;

	description?: string;

	short_description?: string;

	other_info?: string;

	promotion_info?: string;

	promotion_note?: string;

	hover_info?: string;

	video_url?: string;

	thumbnail?: string;

	meta_title?: string;

	meta_keywords?: string;

	meta_image?: string;

	meta_description?: string;

	canonical?: string;

	url?: string;

	redirect_url?: string;

	redirect_type?: number;

	weight?: number;

	length?: number;

	width?: number;

	height?: number;

	warranty_months?: number;

	warranty_address?: string;

	warranty_phone?: string;

	warranty_note?: string;

	product_variations?: ProductVariation[];

	categories_list?: number[];
}
