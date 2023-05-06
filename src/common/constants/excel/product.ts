import { getKeyByValue } from 'src/utils/functions.utils';
import { excelColumnsByAlphabet } from '../constant';
import { ProductStatusEnum, ProductTypeEnum } from '../enum';

export const PRODUCT_SUP_HEADER_ROW_NUM = 1;
export const PRODUCT_HEADER_ROW_NUM = 2;
const productColumnKeysList = [
	{
		key: 'product_name',
		value: 'Tên SP',
		fieldName: 'product_name',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin chung',
			alignment: {
				horizontal: 'center',
				vertical: 'middle'
			},
			border: {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			}
		}
	},
	{
		value: 'Sku',
		fieldName: 'sku',
		key: 'sku',
		width: 20
	},
	{
		value: 'Barcode',
		fieldName: 'barcode',
		key: 'barcode',
		width: 20
	},
	{
		value: 'Loại SP',
		fieldName: 'product_type',
		revertData: (productType: number) => getKeyByValue(ProductTypeEnum, productType),
		key: 'product_type',
		width: 15
	},
	{
		value: 'Ngành hàng',
		fieldName: 'catalog_name',
		key: 'catalog_name',
		width: 15
	},
	{
		value: 'Tình trạng',
		fieldName: 'product_status',
		key: 'product_status',
		revertData: (productStatusType: number) => getKeyByValue(ProductStatusEnum, productStatusType),
		width: 15
	},
	{
		value: 'Trạng thái',
		fieldName: 'status',
		key: 'status',
		revertData: (status: boolean) => (status ? 'Hoạt động' : 'Ngừng hoạt động'),
		width: 15
	},
	{
		value: 'Giá bán lẻ',
		fieldName: 'retail_price',
		key: 'retail_price',
		width: 15
	},
	{
		value: 'Giá bán buôn',
		fieldName: 'wholesale_price',
		key: 'wholesale_price',
		width: 15
	},
	{
		value: 'Giá niêm yết',
		fieldName: 'listed_price',
		key: 'listed_price',
		width: 15
	},
	{
		value: 'Giá thu lại',
		fieldName: 'return_price',
		key: 'return_price',
		width: 15
	},
	{
		value: 'Danh mục',
		fieldName: 'category_name',
		key: 'category_name',
		width: 20,
		mergeCell: true
	},
	// SEO
	{
		value: 'Mô tả ngắn',
		fieldName: 'short_description',
		key: 'short_description',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'SEO',
			alignment: {
				horizontal: 'center',
				vertical: 'middle'
			},
			border: {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			}
		}
	},
	{
		value: 'Mô tả chi tiết',
		fieldName: 'description',
		key: 'description',
		width: 20
	},
	{
		value: 'Thông tin khác',
		fieldName: 'other_info',
		key: 'other_info',
		width: 20
	},
	{
		value: 'Thông tin KM',
		fieldName: 'promotion_info',
		key: 'promotion_info',
		width: 20
	},
	{
		value: 'Meta title',
		fieldName: 'meta_title',
		key: 'meta_title',
		width: 20
	},
	{
		value: 'url',
		fieldName: 'url',
		key: 'url',
		width: 20
	},
	{
		value: 'Meta Description',
		fieldName: 'meta_description',
		key: 'meta_description',
		width: 20
	},
	{
		value: 'Meta Keywords',
		fieldName: 'meta_keywords',
		key: 'meta_keywords',
		width: 20
	},
	{
		value: 'Canonical',
		fieldName: 'canonical',
		key: 'canonical',
		width: 20,
		mergeCell: true
	},
	// BH & vận chuyển
	{
		value: 'Khối lượng (kg)',
		fieldName: 'weight',
		key: 'weight',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin BH',
			alignment: {
				horizontal: 'center',
				vertical: 'middle'
			},
			border: {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' }
			}
		}
	},
	{
		value: 'Chiều dài (cm)',
		fieldName: 'length',
		key: 'length',
		width: 20
	},
	{
		value: 'Chiều rộng (cm)',
		fieldName: 'width',
		key: 'width',
		width: 20
	},
	{
		value: 'Chiều cao (cm)',
		fieldName: 'height',
		key: 'height',
		width: 20
	},
	{
		value: 'Địa chỉ bảo hành',
		fieldName: 'warranty_address',
		key: 'warranty_address',
		width: 20
	},
	{
		value: 'Số ĐT BH',
		fieldName: 'warranty_phone',
		key: 'warranty_phone',
		width: 20
	},
	{
		value: 'Thời hạn BH (tháng)',
		fieldName: 'warranty_months',
		key: 'warranty_months',
		width: 20
	},
	{
		value: 'Ghi chú BH',
		fieldName: 'warranty_note',
		key: 'warranty_note',
		width: 20,
		mergeCell: true
	}
];

const productColumnKeys = productColumnKeysList.reduce((acc, ele, idx) => {
	const alphabet = excelColumnsByAlphabet[idx];
	acc[alphabet] = ele;
	return acc;
}, {});

const headerProductColumns = Object.entries(productColumnKeys).reduce((acc, [key, value]) => {
	acc[`${key}${PRODUCT_HEADER_ROW_NUM}`] = value;
	return acc;
}, {});

const colsList = Object.entries(productColumnKeys)
	.map(([k, v]) => {
		if (v['mergeCell']) {
			return k;
		}
	})
	.filter(Boolean);

const mergedColsList = colsList
	.map((col, idx) => {
		if (idx % 2 && idx > 0)
			return [`${colsList[idx - 1]}${PRODUCT_SUP_HEADER_ROW_NUM}`, `${col}${PRODUCT_SUP_HEADER_ROW_NUM}`];
	})
	.filter(Boolean);

const columnsSubHeader = Object.entries(productColumnKeys).reduce((acc, [k, v]) => {
	if (v['subHeader']) {
		acc[`${k}${PRODUCT_SUP_HEADER_ROW_NUM}`] = v['subHeader'];
	}
	return acc;
}, {});

const dataValidations = (categoriesList: string[], catalogList: string[]) => ({
	D: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${Object.keys(ProductTypeEnum)}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	E: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${catalogList.join(',')}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	F: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${Object.keys(ProductStatusEnum)}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	G: {
		type: 'list',
		allowBlank: true,
		formulae: [`"Hoạt động,Chưa hoạt động"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	L: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${categoriesList.join(',')}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	}
});

export const productExportConfig = new Map();
productExportConfig.set('productColumnKeys', productColumnKeys);
productExportConfig.set('headerProductColumns', headerProductColumns);
productExportConfig.set('mergedColsList', mergedColsList);
productExportConfig.set('columnsSubHeader', columnsSubHeader);
productExportConfig.set('dataValidations', dataValidations);
