import { excelColumnsByAlphabet } from '../constant';
export const ORDER_DELIVERY_SUP_HEADER_ROW_NUM = 1;
export const ORDER_DELIVERY_HEADER_ROW_NUM = 2;

const orderDeliveryColumnKeysList = [
	{
		key: 'id',
		value: 'ID',
		fieldName: 'id',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin đơn hàng',
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
		value: 'Mã đơn hàng',
		fieldName: 'order_code',
		key: 'order_code',
		width: 20
	},
	{
		value: 'Nguồn đơn',
		fieldName: 'platform_name',
		key: 'platform_name',
		width: 20
	},
	{
		value: 'Trạng thái đơn hàng',
		fieldName: 'order_status_name',
		key: 'order_status_name',
		width: 25
	},
	{
		value: 'Số lượng',
		fieldName: 'total_quantity',
		key: 'total_quantity',
		width: 20
	},
	{
		value: 'Chiết khấu',
		fieldName: 'coupon_value',
		key: 'coupon_value',
		width: 20
	},
	{
		value: 'Phí vận chuyển',
		fieldName: 'shipping_fee',
		key: 'shipping_fee',
		width: 20
	},
	{
		value: 'Tổng tiền đơn hàng',
		fieldName: 'final_total_money_amount',
		key: 'final_total_money_amount',
		width: 20
	},
	{
		value: 'Tiền thu KH',
		fieldName: 'cod',
		key: 'cod',
		width: 20
	},
	{
		value: 'Chi tiết đơn',
		fieldName: 'order_details',
		key: 'order_details',
		width: 50,
		mergeCell: true
	},

	{
		value: 'Đơn vị vận chuyển',
		fieldName: 'shipping_unit_name',
		key: 'shipping_unit_name',
		width: 20,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin vận đơn',
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
		value: 'Trạng thái vận đơn',
		fieldName: 'delivery_status_name',
		key: 'delivery_status_name',
		width: 20
	},
	{
		value: 'Mã vận đơn',
		fieldName: 'delivery_code',
		key: 'delivery_code',
		width: 20
	},
	{
		value: 'Dịch vụ',
		fieldName: 'delivery_service_name',
		key: 'delivery_service_name',
		width: 20,
		mergeCell: true
	},
	{
		value: 'Hình thức thanh toán',
		fieldName: 'payment_method',
		key: 'payment_method',
		width: 25,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin Thanh toán',
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
		value: 'Phương thức thanh toán',
		fieldName: 'delivery_payment_method_name',
		key: 'delivery_payment_method_name',
		width: 20
	},
	{
		value: 'Trạng thái thanh toán',
		fieldName: 'payment_status_name',
		key: 'payment_status_name',
		width: 25
	},
	{
		value: 'Ngày tạo vận đơn',
		fieldName: 'created_at',
		key: 'created_at',
		width: 20,
		mergeCell: true
	},
	{
		value: 'Người gửi',
		fieldName: 'sender_name',
		key: 'sender_name',
		width: 25,
		mergeCell: true,
		subHeader: {
			value: 'Thông tin giao nhận',
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
		value: 'Địa chỉ gửi',
		fieldName: 'sender_full_address',
		key: 'sender_full_address',
		width: 20
	},
	{
		value: 'SĐT người gửi',
		fieldName: 'sender_phone',
		key: 'sender_phone',
		width: 20
	},
	{
		value: 'Người nhận',
		fieldName: 's_fullname',
		key: 'b_fullname',
		width: 20
	},
	{
		value: 'Địa chỉ người nhận',
		fieldName: 's_full_address',
		key: 'b_full_address',
		width: 20
	},
	{
		value: 'SĐT người nhận',
		fieldName: 's_phone',
		key: 's_phone',
		width: 20
	},
	{
		value: 'Ghi chú',
		fieldName: 'notes',
		key: 'notes',
		width: 20,
		mergeCell: true
	}
];

const orderDeliveryColumnKeys = orderDeliveryColumnKeysList.reduce((acc, ele, idx) => {
	const alphabet = excelColumnsByAlphabet[idx];
	acc[alphabet] = ele;
	return acc;
}, {});

const headerOrderDeliveryColumns = Object.entries(orderDeliveryColumnKeys).reduce((acc, [key, value]) => {
	acc[`${key}${ORDER_DELIVERY_HEADER_ROW_NUM}`] = value;
	return acc;
}, {});

const colsList = Object.entries(orderDeliveryColumnKeys)
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
				`${colsList[idx - 1]}${ORDER_DELIVERY_SUP_HEADER_ROW_NUM}`,
				`${col}${ORDER_DELIVERY_SUP_HEADER_ROW_NUM}`
			];
	})
	.filter(Boolean);

const columnsSubHeader = Object.entries(orderDeliveryColumnKeys).reduce((acc, [k, v]) => {
	if (v['subHeader']) {
		acc[`${k}${ORDER_DELIVERY_SUP_HEADER_ROW_NUM}`] = v['subHeader'];
	}
	return acc;
}, {});

export const orderDeliveryExportConfig = new Map();
orderDeliveryExportConfig.set('orderDeliveryColumnKeys', orderDeliveryColumnKeys);
orderDeliveryExportConfig.set('headerProductColumns', headerOrderDeliveryColumns);
orderDeliveryExportConfig.set('mergedColsList', mergedColsList);
orderDeliveryExportConfig.set('columnsSubHeader', columnsSubHeader);
