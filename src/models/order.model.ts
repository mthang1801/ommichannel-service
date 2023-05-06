import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { OrderStatusEnum, PaymentStatusEnum, UserGenderEnum } from 'src/common/constants/enum';
import { Customer } from 'src/models/customer.model';
import { OrderDeliveryLog } from 'src/models/orderDeliveryLog.model';
import { OrderDetail } from 'src/models/orderDetail.model';
import { OrderPaymentDetail } from 'src/models/orderPaymentDetail.model';
import { OrderStatusLog } from 'src/models/orderStatusLog.model';
import { Platform } from 'src/models/platform.model';
import { Seller } from 'src/models/seller.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { Warehouse } from 'src/models/warehouse.model';
import { CodAndCarriageBill } from './codAndCarriageBill.model';
import { OrderPaymentLog } from './orderPaymentLog.model';

@Table({
	tableName: 'orders',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	indexes: [
		{
			fields: ['b_phone', 'b_fullname', 'b_email', 'order_code'],
			name: 'b_phone__b_fullname__b_email__order_code'
		}
	]
})
export class Order extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => Platform)
	@Column
	declare platform_id: number;

	@Column
	declare platform_name: string;

	@BelongsTo(() => Platform)
	platform: Platform;

	@Column({
		type: DataType.STRING(18),
		unique: true
	})
	declare order_code: string;

	@ForeignKey(() => CodAndCarriageBill)
	declare cod_and_carriage_bill_id: number;

	@BelongsTo(() => CodAndCarriageBill)
	cod_and_carriage_bill: CodAndCarriageBill;

	@Column({ defaultValue: false })
	declare receive_at_store: boolean;

	@ForeignKey(() => Customer)
	@Column
	declare customer_id: number;

	@BelongsTo(() => Customer)
	customer: Customer;

	@ForeignKey(() => Warehouse)
	@Column
	declare warehouse_id: number;

	@BelongsTo(() => Warehouse)
	warehouse: Warehouse;

	@Column
	declare order_platform_id: number;

	@Column({
		type: DataType.STRING(64)
	})
	declare order_platform_code: string;

	@Column({
		defaultValue: OrderStatusEnum.Mới
	})
	declare order_status_id: number;

	@Column
	declare order_status_name: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(PaymentStatusEnum),
		defaultValue: PaymentStatusEnum['Chưa thanh toán']
	})
	declare payment_status: PaymentStatusEnum;

	@Column
	declare payment_status_name: string;

	@Column
	declare payment_method_id: string;

	@Column
	declare delivery_status_id: number;

	@Column
	declare delivery_status_name: string;

	@Column
	declare total_quantity: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare total_discount_money_amount: number;

	@Column
	declare coupon_code: string;

	@Column({ type: DataType.DOUBLE, comment: 'Giá trị mã coupon', defaultValue: 0 })
	declare coupon_value: number;

	@Column({ comment: 'Sử dụng điểm', defaultValue: 0 })
	declare used_point: number;

	@Column({ comment: 'Giá trị Sử dụng điểm', defaultValue: 0 })
	declare used_point_value: number;

	@Column({
		type: DataType.DOUBLE,
		defaultValue: 0
	})
	declare temp_total_money_amount: number;

	@Column({
		type: DataType.DOUBLE,
		defaultValue: 0
	})
	declare final_total_money_amount: number;

	@ForeignKey(() => ShippingUnit)
	@Column
	declare shipping_unit_id: number;

	@BelongsTo(() => ShippingUnit)
	shipping_unit: ShippingUnit;

	@Column
	declare shipping_unit_name: string;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare shipping_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_main_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_cod_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_insurance_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_lifting_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_remote_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_counting_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_packing_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_other_fee: number;

	@Column
	declare delivery_id: number;

	@Column({
		type: DataType.STRING(128),
		comment: 'Mã vận đơn'
	})
	declare delivery_code: string;

	@Column
	declare delivery_service_id: number;

	@Column
	declare delivery_service_name: string;

	@Column
	declare delivery_payment_method_id: number;

	@Column
	declare delivery_payment_method_name: string;

	@Column({ comment: '1. Shop, 2. Customer' })
	declare delivery_payment_by: number;

	@Column({ type: DataType.DOUBLE })
	declare cod: number;

	@Column({ type: DataType.DOUBLE })
	declare paid_money_amount: number;

	@Column({ type: DataType.FLOAT })
	declare weight: number;

	@Column({ type: DataType.FLOAT })
	declare length: number;

	@Column({ type: DataType.FLOAT })
	declare width: number;

	@Column({ type: DataType.FLOAT })
	declare height: number;

	@Column
	declare customer_platform_id: number;

	@Column({
		type: DataType.STRING(256)
	})
	declare b_fullname: string;

	@Column({
		type: DataType.STRING(20)
	})
	declare b_phone: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare b_email: string;

	@Column({
		type: DataType.DATE
	})
	declare b_dob: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(UserGenderEnum),
		comment: Object.entries(UserGenderEnum)
			.map(([key, val]) => `${key} : ${val}`)
			.join(', ')
	})
	declare b_gender: UserGenderEnum;

	@Column({
		type: DataType.STRING(256)
	})
	declare s_fullname: string;

	@Column
	declare s_province_id: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare s_province: string;

	@Column
	declare s_district_id: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare s_district: string;

	@Column
	declare s_ward_id: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare s_ward: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare s_address: string;

	@Column({
		type: DataType.STRING(20)
	})
	declare s_phone: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare s_email: string;

	@Column({
		type: DataType.TEXT
	})
	declare notes: string;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm bắt đầu vận chuyển'
	})
	declare delivery_date: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian đơn vị vận chuyển call qua'
	})
	declare delivery_push_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm xác nhận đơn'
	})
	declare confirmed_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm chờ / đang đóng gói'
	})
	declare packaging_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm đóng gói hoàn tất'
	})
	declare packaged_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Chờ vận chuyển'
	})
	declare push_shipping_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Đơn vị vận chuyển lấy hàng'
	})
	declare picked_up_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian giao hàng không thành công'
	})
	declare delivery_failed_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian huỷ hàng.'
	})
	declare delivery_canceled_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm giao hàng'
	})
	declare delivery_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm giao hàng kỳ vọng'
	})
	declare delivery_expected_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm đang hoàn hàng'
	})
	declare returning_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm hoàn hàng'
	})
	declare returned_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm huỷ đơn'
	})
	declare canceled_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm giao thành công'
	})
	declare delivery_success_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm hoàn tất đơn'
	})
	declare closed_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Thanh toán'
	})
	declare payment_at: Date;

	@Column
	declare cancel_reason: string;

	@Column({ type: DataType.DOUBLE, comment: 'tiền cước' })
	declare carriage: number;

	@Column({ comment: 'Người nhận phí trả cước' })
	declare carriage_forward: string;

	@Column
	declare delivery_request: string;

	@Column({
		type: DataType.TEXT,
		comment: 'Ghi chú giao hàng'
	})
	declare delivery_note: string;

	@Column
	declare created_by: number;

	@Column
	declare updated_by: number;

	@HasMany(() => OrderDetail)
	details: OrderDetail[];

	@HasMany(() => OrderPaymentDetail)
	order_payment_details: OrderPaymentDetail[];

	@HasMany(() => OrderStatusLog)
	order_status_logs: OrderStatusLog[];

	@HasMany(() => OrderDeliveryLog)
	order_delivery_logs: OrderDeliveryLog[];

	@HasMany(() => OrderPaymentLog)
	order_payment_logs: OrderPaymentLog[];
}
