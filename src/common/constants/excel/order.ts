import { getKeyByValue } from 'src/utils/functions.utils';
import { excelColumnsByAlphabet } from '../constant';
import { OrderStatusEnum } from 'src/common/constants/enum';

export const ORDER_SUP_HEADER_ROW_NUM = 1;
export const ORDER_HEADER_ROW_NUM = 2;
const orderColumnKeysList = [
	{
		key: 'order_code',
		value: 'Mã đơn hàng',
		fieldName: 'order_code',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Chi tiết đơn hàng',
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
		value: 'Trạng thái đơn hàng',
		fieldName: 'order_status_id',
		revertData: (orderStatus: number) => getKeyByValue(OrderStatusEnum, orderStatus),
		key: 'order_status_id',
		width: 20
	},
	{
		value: 'Nguồn đơn hàng',
		fieldName: 'platform_name',
		key: 'platform_name',
		width: 20
	},
	{
		value: 'Kho hàng',
		fieldName: 'warehouse_name',
		key: 'warehouse_name',
		width: 15
	},
	{
		value: 'Sản phẩm',
		fieldName: 'products',
		key: 'products',
		width: 100,
		wraptext: true
	},
	{
		value: 'Tiền hàng',
		fieldName: 'temp_total_money_amount',
		key: 'temp_total_money_amount',
		width: 15
	},
	{
		value: 'Phí COD',
		fieldName: 'delivery_cod_fee',
		key: 'delivery_cod_fee',
		width: 15
	},
	{
		value: 'Phí vận chuyển',
		fieldName: 'shipping_fee',
		key: 'shipping_fee',
		width: 15
	},
	{
		value: 'Tổng tiền',
		fieldName: 'total_amount',
		key: 'total_amount',
		width: 15,
		mergeCell: true
	},
	// Thông tin mua hàng
	{
		value: 'Số điện thoại',
		fieldName: 'b_phone',
		key: 'b_phone',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin mua hàng',
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
		value: 'Họ tên',
		fieldName: 'b_fullname',
		key: 'b_fullname',
		width: 20
	},
	{
		value: 'Điểm tích luỹ',
		fieldName: 'used_point',
		key: 'used_point',
		width: 20
	},
	{
		value: 'Giá trị quy đổi',
		fieldName: 'used_point_value',
		key: 'used_point_value',
		width: 20,
		mergeCell: true
	},
	// Thông tin giao hàng
	{
		value: 'Tên khách hàng',
		fieldName: 's_fullname',
		key: 's_fullname',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin giao hàng',
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
		value: 'Số điện thoại',
		fieldName: 's_phone',
		key: 's_phone',
		width: 20
	},
	{
		value: 'Địa chỉ',
		fieldName: 's_address',
		key: 's_address',
		width: 50,
		mergeCell: true,
		wraptext: true
	},
	// Thông tin thanh toán
	{
		value: 'Thông tin thanh toán',
		fieldName: 'payment_detail',
		key: 'payment_detail',
		width: 85,
		mergeCell: true,
		wraptext: true,
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
		}
	},
	{
		value: 'Đã thanh toán',
		fieldName: 'paid_money_amount',
		key: 'paid_money_amount',
		width: 20
	},
	{
		value: 'Còn phải trả',
		fieldName: 'remain_amount',
		key: 'remain_amount',
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
			value: 'Thông tin vận chuyển',
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
		value: 'Yêu cầu giao hàng',
		fieldName: 'notes',
		key: 'notes',
		width: 20
	},
	{
		value: 'Ghi chú giao hàng',
		fieldName: 'notes',
		key: 'notes',
		width: 20
	},
	{
		value: 'Đơn vị vận chuyển',
		fieldName: 'shipping_unit_name',
		key: 'shippng_unit_name',
		width: 20
	},
	{
		value: 'Dịch vụ vận chuyển',
		fieldName: 'delivery_service_name',
		key: 'delivery_service_name',
		width: 20
	},
	{
		value: 'Hình thức thanh toán',
		fieldName: 'delivery_payment_method_name',
		key: 'delivery_payment_method_name',
		width: 20
	},
	{
		value: 'Dự kiến giao hàng',
		fieldName: 'delivery_expected_at',
		key: 'delivery_expected_at',
		width: 20,
		mergeCell: true
	}
];

const orderColumnKeys = orderColumnKeysList.reduce((acc, ele, idx) => {
	const alphabet = excelColumnsByAlphabet[idx];
	acc[alphabet] = ele;
	return acc;
}, {});

const headerOrderColumns = Object.entries(orderColumnKeys).reduce((acc, [key, value]) => {
	acc[`${key}${ORDER_HEADER_ROW_NUM}`] = value;
	return acc;
}, {});

const colsList = Object.entries(orderColumnKeys)
	.map(([k, v]) => {
		if (v['mergeCell']) {
			return k;
		}
	})
	.filter(Boolean);

const mergedColsList = colsList
	.map((col, idx) => {
		if (idx % 2 && idx > 0)
			return [`${colsList[idx - 1]}${ORDER_SUP_HEADER_ROW_NUM}`, `${col}${ORDER_SUP_HEADER_ROW_NUM}`];
	})
	.filter(Boolean);

const columnsSubHeader = Object.entries(orderColumnKeys).reduce((acc, [k, v]) => {
	if (v['subHeader']) {
		acc[`${k}${ORDER_SUP_HEADER_ROW_NUM}`] = v['subHeader'];
	}
	return acc;
}, {});

const dataValidations = () => ({
	B: {
		type: 'list',
		allowBlank: true,
		formulae: [`"${Object.keys(OrderStatusEnum)}"`],
		showErrorMessage: true,
		errorStyle: 'error',
		error: 'The value Valid'
	}
});

export const orderExportConfig = new Map();
orderExportConfig.set('orderColumnKeys', orderColumnKeys);
orderExportConfig.set('headerOrderColumns', headerOrderColumns);
orderExportConfig.set('mergedColsList', mergedColsList);
orderExportConfig.set('columnsSubHeader', columnsSubHeader);
orderExportConfig.set('dataValidations', dataValidations);
