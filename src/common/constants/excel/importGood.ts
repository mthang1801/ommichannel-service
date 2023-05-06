import { getKeyByValue } from 'src/utils/functions.utils';
import { excelColumnsByAlphabet } from '../constant';
import { ImportGoodPaymentMethodEnumString, OrderStatusEnum } from 'src/common/constants/enum';

export const IMPORT_GOOD_SUP_HEADER_ROW_NUM = 1;
export const IMPORT_GOOD_HEADER_ROW_NUM = 2;
const importGoodColumnKeysList = [
	{
		key: 'products',
		value: 'Sản phẩm',
		fieldName: 'products',
		width: 80,
		subHeader: {
			value: 'Thông tin nhập kho',
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
	// Thông tin nhà cung cấp
	{
		value: 'Nhà cung cấp',
		fieldName: 'supplier',
		key: 'supplier',
		width: 20,
		subHeader: {
			value: 'Thông tin nhà cung cấp',
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
	// Thông tin thanh toán
	{
		value: 'Số tiền cần thanh toán',
		fieldName: 'total_amount',
		key: 'total_amount',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin thanh toán',
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
		},
		wraptext: true
	},
	{
		value: 'Số tiền thanh toán',
		fieldName: 'paid_amount',
		key: 'paid_amount',
		width: 20
	},
	{
		value: 'Số tiền còn lại',
		fieldName: 'debit_amount',
		key: 'debit_amount',
		width: 20
	},
	{
		value: 'Hình thức thanh toán',
		fieldName: 'payment_method',
		key: 'payment_method',
		width: 20
	},
	{
		value: 'Mã tham chiếu',
		fieldName: 'payment_code',
		key: 'payment_code',
		width: 20
	},
	{
		value: 'Người thanh toán',
		fieldName: 'payment_by',
		key: 'payment_by',
		width: 20
	},
	{
		value: 'Ngày thanh toán',
		fieldName: 'payment_at',
		key: 'payment_at',
		width: 20,
		mergeCell: true
	},
	// Thông tin nhập kho
	{
		value: 'Kho hàng',
		fieldName: 'warehouse',
		key: 'warehouse',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin nhập kho',
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
		value: 'Người nhập',
		fieldName: 'input_by',
		key: 'input_by',
		width: 20
	},
	{
		value: 'Ngày nhập kho',
		fieldName: 'input_at',
		key: 'input_at',
		width: 20,
		mergeCell: true
	}
];

const importGoodColumnKeys = importGoodColumnKeysList.reduce((acc, ele, idx) => {
	const alphabet = excelColumnsByAlphabet[idx];
	acc[alphabet] = ele;
	return acc;
}, {});

const headerImportGoodColumns = Object.entries(importGoodColumnKeys).reduce((acc, [key, value]) => {
	acc[`${key}${IMPORT_GOOD_HEADER_ROW_NUM}`] = value;
	return acc;
}, {});

const colsList = Object.entries(importGoodColumnKeys)
	.map(([k, v]) => {
		if (v['mergeCell']) {
			return k;
		}
	})
	.filter(Boolean);

const mergedColsList = colsList
	.map((col, idx) => {
		if (idx % 2 && idx > 0)
			return [`${colsList[idx - 1]}${IMPORT_GOOD_SUP_HEADER_ROW_NUM}`, `${col}${IMPORT_GOOD_SUP_HEADER_ROW_NUM}`];
	})
	.filter(Boolean);

const columnsSubHeader = Object.entries(importGoodColumnKeys).reduce((acc, [k, v]) => {
	if (v['subHeader']) {
		acc[`${k}${IMPORT_GOOD_SUP_HEADER_ROW_NUM}`] = v['subHeader'];
	}
	return acc;
}, {});

const dataValidations = (warehouseList: string[], staffList: string[], supplierList: string[]) => ({
	B: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${supplierList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	J: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${warehouseList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	F: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${Object.keys(ImportGoodPaymentMethodEnumString)}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	H: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${staffList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	K: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${staffList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	}
});

export const importGoodExportConfig = new Map();
importGoodExportConfig.set('importGoodColumnKeys', importGoodColumnKeys);
importGoodExportConfig.set('headerImportGoodColumns', headerImportGoodColumns);
importGoodExportConfig.set('mergedColsList', mergedColsList);
importGoodExportConfig.set('columnsSubHeader', columnsSubHeader);
importGoodExportConfig.set('dataValidations', dataValidations);
