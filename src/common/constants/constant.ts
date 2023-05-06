import { join } from 'path';
import { shippingUnitConfig, urlConfig } from 'src/configs/configs';
import { ProductTabEnum } from './enum';

export const PREFIX_SVC = 'OMS';
export const FunctCodeSign = '__';
export const filterSeperator = '&';

const { dirname } = require('path');
export const appDir = dirname(require.main.filename);

export const dataConstantsDir = join(process.cwd(), 'src', 'common', 'constants', 'data');
export const alphabetExcelSingleColumn = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const columnsASuffix = alphabetExcelSingleColumn.split('').map((item) => `A${item}`);
export const excelColumnsByAlphabet = alphabetExcelSingleColumn.split('').concat(columnsASuffix);

export const Auth = Object.freeze({
	AUTH_TOKEN_EXPIRED_AT: 3 * 3600 * 1000, //3 hours
	AUTH_USER_ID_POSITION: 3,
	AUTH_USER_ROLE_ID_POSITION: 4,
	AUTH_SELLER_ID_POSITION: 2
});

export const RoleFunct = Object.freeze({
	SYSTEM_ADMIN_ROLE_ID: 1,
	SYSTEM_ADMIN_ROLE_NAME: 'System Admin'
});

export const WinstonColors = Object.freeze({
	info: '\x1b[36m',
	error: '\x1b[31m',
	warn: '\x1b[33m',
	verbose: '\x1b[43m'
});

export const GetInternalUrl = Object.freeze({
	API_URL: urlConfig.api,
	WEBSITE_URL: urlConfig.website
});

export const DateTimeManagement = Object.freeze({
	TOKEN_EXPIRED_IN: 3 * 60 * 60 * 1000
});

export const HttpMessageResponseByStatusCode = Object.freeze({
	'200': 'Thành công',
	'201': 'Tạo thành công',
	'400': 'Lỗi request với tham số không hợp lệ',
	'404': 'Không tìm thấy',
	'500': 'Lỗi hệ thống',
	'502': 'Thời gian request quá lâu.'
});

export const sequelizeProvider = 'SEQUELIZE';

export const platformsList = [
	{
		id: 1,
		platform_name: 'Haravan',
		platform_code: 'haravan'
	},
	{
		id: 2,
		platform_name: 'Lazada',
		platform_code: 'lazada'
	},
	{
		id: 3,
		platform_name: 'Tiki',
		platform_code: 'tiki'
	},
	{
		id: 4,
		platform_name: 'Shopee',
		platform_code: 'shopee'
	},
	{
		id: 5,
		platform_name: 'KiotViet',
		platform_code: 'kiotviet'
	},
	{
		id: 6,
		platform_name: 'Yes24h',
		platform_code: 'yes24h'
	},
	{
		id: 7,
		platform_name: 'Sendo',
		platform_code: 'Sendo'
	},
	{
		id: 8,
		platform_name: 'Website',
		platform_code: 'website'
	},
	{
		id: 9,
		platform_name: 'POS',
		platform_code: 'pos'
	}
];

export const ProductsLogsFieldsList = {
	parent_id: ProductTabEnum['Thông tin sản phẩm'],
	product_name: ProductTabEnum['Thông tin sản phẩm'],
	sku: ProductTabEnum['Thông tin sản phẩm'],
	barcode: ProductTabEnum['Thông tin sản phẩm'],
	product_name_vat: ProductTabEnum['Thông tin sản phẩm'],
	sku_vat: ProductTabEnum['Thông tin sản phẩm'],
	vat: ProductTabEnum['Thông tin sản phẩm'],
	status: ProductTabEnum['Thông tin sản phẩm'],
	catalog_id: ProductTabEnum['Thông tin sản phẩm'],
	product_status: ProductTabEnum['Thông tin sản phẩm'],
	product_type: ProductTabEnum['Thông tin sản phẩm'],
	virtual_stock_quantity: ProductTabEnum['Thông tin sản phẩm'],
	retail_price: ProductTabEnum['Thông tin sản phẩm'],
	wholesale_price: ProductTabEnum['Thông tin sản phẩm'],
	listed_price: ProductTabEnum['Thông tin sản phẩm'],
	return_price: ProductTabEnum['Thông tin sản phẩm'],
	import_price: ProductTabEnum['Thông tin sản phẩm'],
	categories_list: ProductTabEnum['Thông tin sản phẩm'],
	root_category_url: ProductTabEnum['Thông tin sản phẩm'],
	allow_installment: ProductTabEnum['Thông tin sản phẩm'],
	description: ProductTabEnum.SEO,
	short_description: ProductTabEnum.SEO,
	other_info: ProductTabEnum.SEO,
	promotion_info: ProductTabEnum.SEO,
	video_url: ProductTabEnum.SEO,
	thumbnail: ProductTabEnum.SEO,
	meta_title: ProductTabEnum.SEO,
	meta_keywords: ProductTabEnum.SEO,
	meta_image: ProductTabEnum.SEO,
	meta_description: ProductTabEnum.SEO,
	canonical: ProductTabEnum.SEO,
	url: ProductTabEnum.SEO,
	redirect_url: ProductTabEnum.SEO,
	redirect_type: ProductTabEnum.SEO,
	weight: ProductTabEnum['Bảo hành & vận chuyển'],
	length: ProductTabEnum['Bảo hành & vận chuyển'],
	width: ProductTabEnum['Bảo hành & vận chuyển'],
	height: ProductTabEnum['Bảo hành & vận chuyển'],
	warranty_months: ProductTabEnum['Bảo hành & vận chuyển'],
	warranty_address: ProductTabEnum['Bảo hành & vận chuyển'],
	warranty_phone: ProductTabEnum['Bảo hành & vận chuyển'],
	warranty_note: ProductTabEnum['Bảo hành & vận chuyển']
};

export const defineShippingUnits = {
	NTL: {
		id: 1,
		shippingName: 'Nhất Tín Logistics',
		keys: ['username', 'password'],
		api: {
			signIn: `${shippingUnitConfig.NTL.api}v1/auth/sign-in`,
			calcFee: `${shippingUnitConfig.NTL.api}v1/bill/calc-fee`,
			createBillShipping: `${shippingUnitConfig.NTL.api}v1/bill/create`,
			trackingBill: `${shippingUnitConfig.NTL.api}/v1/bill/tracking`
		}
	},
	NTX: {
		id: 2,
		shippingName: 'Nhất Tín Express',
		keys: ['username', 'password']
	},
	SPX: {
		id: 3,
		shippingName: 'Shopee Expresss',
		keys: ['username', 'password']
	}
};

export const dataConstantFileName = Object.freeze({
	generalSettings: 'generalSettings.json'
});

export const mappingNTLDeliveiryStatus = {
	'2': 7,
	'3': 8,
	'4': 10,
	'6': 16,
	'7': 11,
	'9': 13,
	'10': 14,
	'11': 11,
	'12': '',
	'13': 9
};

export const PromotionApplyMethodType = {
	'CK Áp dụng cho tất cả SP': 0,
	'CK Tổng giá trị đơn hàng': 1,
	'CK Từng SP': 2,
	'CK Danh Mục SP': 3,
	'CK Số lượng SP': 4,
	'CK Số lượng SP (theo danh mục)': 5
};

export const CENTRAL_WAREHOUSE_CODE = (sellerId) => `CENTRALWH${sellerId}`;
export const CENTRAL_WAREHOUSE_NAME = 'Kho trung tâm';

// Fix cứng code của 3 gói dịch vụ để phân quyền cho các seller
export const FIXED_SERVICE_PACKAGE_CODE = {
	BASIC: 'BASIC',
	PREMIUM: 'PREMIUM',
	PROFESSIONAL: 'PROFESSIONAL'
};

export const FIXED_SERVICE_PACKAGE_ID = {
	BASIC: 1,
	PREMIUM: 2,
	PROFESSIONAL: 3
};

export const exportFileNames = {
	sampleProduct: `export_sample_product.xlsx`,
	productLists: `export_products_list.xlsx`,
	sampleOrder: `export_sample_order.xlsx`,
	orderLists: `export_orders_list.xlsx`,
	sampleImportGood: `sample_import_good.xlsx`,
	sampleInventoryReceipt: `sample_inventory_receipt.xlsx`,
	orderDeliveriesList: `export_order_deliveries_list.xlsx`
};

export const workSheetName = {
	sampleProduct: 'Mẫu sản phẩm',
	productsList: 'Danh sách SP',
	orderList: 'Danh sách đơn hàng',
	orderDeliveriesList: 'Danh sách vận đơn',
	importGoodList: 'Danh sách đơn nhập hàng',
	sampleOrder: 'Mẫu đơn hàng',
	sampleImportGood: 'Mẫu đơn nhập hàng',
	sampleInventoryReceipt: 'Mẫu phiếu kiểm hàng',
	inventoryReceiptList: 'Danh sách phiếu kiểm hàng'
};
