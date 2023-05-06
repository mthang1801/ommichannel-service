import { getKeyByValue, typeOf } from 'src/utils/functions.utils';
import { excelColumnsByAlphabet } from '../constant';
import {
	InventoryReceiptStatusEnum,
	InventoryReceiptStatusEnumString,
	OrderStatusEnum
} from 'src/common/constants/enum';

export const INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM = 1;
export const INVENTORY_RECEIPT_HEADER_ROW_NUM = 2;
const inventoryReceiptColumnKeysList = [
	{
		key: 'warehouse',
		value: 'Kho kiểm hàng',
		fieldName: 'warehouse',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin phiếu kiểm hàng',
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
		value: 'Trạng thái',
		fieldName: 'status',
		key: 'status',
		width: 20
	},
	{
		value: 'Nhân viên kiểm',
		fieldName: 'inventory_staff',
		key: 'inventory_staff',
		width: 20
	},
	{
		value: 'Ngày kiểm',
		fieldName: 'inventory_at',
		key: 'inventory_at',
		width: 20
	},
	{
		value: 'Nhân viên cân bằng',
		fieldName: 'balance_staff',
		key: 'balance_staff',
		width: 20
	},
	{
		value: 'Ngày cân bằng',
		fieldName: 'balance_at',
		key: 'balance_at',
		width: 20
	},
	{
		value: 'Ghi chú',
		fieldName: 'note',
		key: 'note',
		width: 20,
		mergeCell: true
	},
	// Danh sách sản phẩm
	{
		value: 'Sản phẩm',
		fieldName: 'products',
		key: 'products',
		width: 60,
		subHeader: {
			value: 'Danh sách sản phẩm',
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
	}
];

const inventoryReceiptColumnKeys = inventoryReceiptColumnKeysList.reduce((acc, ele, idx) => {
	const alphabet = excelColumnsByAlphabet[idx];
	acc[alphabet] = ele;
	return acc;
}, {});

const headerInventoryReceiptColumns = Object.entries(inventoryReceiptColumnKeys).reduce((acc, [key, value]) => {
	acc[`${key}${INVENTORY_RECEIPT_HEADER_ROW_NUM}`] = value;
	return acc;
}, {});

const colsList = Object.entries(inventoryReceiptColumnKeys)
	.map(([k, v]) => {
		if (v['mergeCell']) {
			return k;
		}
	})
	.filter(Boolean);

const mergedColsList = colsList
	.map((col, idx) => {
		if (idx % 2 && idx > 0)
			return [
				`${colsList[idx - 1]}${INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM}`,
				`${col}${INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM}`
			];
	})
	.filter(Boolean);

const columnsSubHeader = Object.entries(inventoryReceiptColumnKeys).reduce((acc, [k, v]) => {
	if (v['subHeader']) {
		acc[`${k}${INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM}`] = v['subHeader'];
	}
	return acc;
}, {});

const dataValidations = (warehouseList: string[], staffList: string[]) => ({
	A: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${warehouseList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	B: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${Object.keys(InventoryReceiptStatusEnumString)}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	C: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${staffList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	},
	E: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${staffList}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	}
	// G: {
	// 	type: 'list',
	// 	allowBlank: true,
	// 	formulae: [`"Hoạt động,Chưa hoạt động"`],
	// 	showErrorMessage: true,
	// 	errorStyle: 'error',
	// 	error: 'The value Valid'
	// },
});

export const inventoryReceiptExportConfig = new Map();
inventoryReceiptExportConfig.set('inventoryReceiptColumnKeys', inventoryReceiptColumnKeys);
inventoryReceiptExportConfig.set('headerInventoryReceiptColumns', headerInventoryReceiptColumns);
inventoryReceiptExportConfig.set('mergedColsList', mergedColsList);
inventoryReceiptExportConfig.set('columnsSubHeader', columnsSubHeader);
inventoryReceiptExportConfig.set('dataValidations', dataValidations);
