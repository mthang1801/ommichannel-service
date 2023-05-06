import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PaymentStatusEnum, UserGenderEnum } from '../common/constants/enum';
import { CodAndCarriageBill } from './codAndCarriageBill.model';
import { Customer } from './customer.model';
import { Order } from './order.model';
import { OrderDeliveryLog } from './orderDeliveryLog.model';
import { OrderDetail } from './orderDetail.model';
import { Platform } from './platform.model';
import { Seller } from './seller.model';
import { ShippingUnit } from './shippingUnit.model';
import { Warehouse } from './warehouse.model';

@Table({ tableName: 'order_deliveries', underscored: true, timestamps: true, updatedAt: true })
export class OrderDelivery extends Model {
	@ForeignKey(() => Order)
	@Column
	declare order_id: number;

	@BelongsTo(() => Order)
	declare order: Order;

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

	@Column({
		type: DataType.STRING(64)
	})
	declare order_platform_code: string;

	@Column({
		type: DataType.STRING(18),
		unique: true
	})
	declare order_code: string;

	@ForeignKey(() => CodAndCarriageBill)
	declare cod_and_carriage_bill_id: number;

	@BelongsTo(() => CodAndCarriageBill)
	declare cod_and_carriage_bill: CodAndCarriageBill;

	@Column
	declare for_control_status: number;

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
	declare order_status_id: number;

	@Column
	declare order_status_name: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(PaymentStatusEnum)
	})
	declare payment_status: PaymentStatusEnum;

	@ApiPropertyOptional({ example: '' })
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

	@Column({
		defaultValue: 0
	})
	declare total_discount_money_amount: number;

	@Column
	declare coupon_code: string;

	@Column({ type: DataType.DOUBLE, comment: 'Giá trị mã coupon' })
	declare coupon_value: number;

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

	@Column
	declare delivery_cod_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_insurance_fee: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare delivery_lifting_fee: number;

	@Column
	declare delivery_remote_fee: number;

	@Column
	declare delivery_counting_fee: number;

	@Column
	declare delivery_packing_fee: number;

	@Column
	declare delivery_other_fee: number;

	@Column
	declare delivery_id: number;

	@Column({
		type: DataType.STRING(128),
		comment: 'Mã vận đơn'
	})
	declare delivery_code: string;

	@ApiPropertyOptional({ example: 1 })
	@Column
	declare delivery_service_id: number;

	@ApiPropertyOptional({ example: 'Express' })
	@Column
	declare delivery_service_name: string;

	@ApiPropertyOptional({ example: 1 })
	@Column
	declare delivery_payment_method_id: number;

	@ApiPropertyOptional({ example: '' })
	@Column
	declare delivery_payment_method_name: string;

	@Column({ comment: '1. Shop, 2. Customer' })
	declare delivery_payment_by: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare cod: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare paid_money_amount: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare debit_amount: number;

	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare weight: number;

	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare length: number;

	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare width: number;

	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare height: number;

	@ApiPropertyOptional({ example: 'John Doe' })
	@Column
	declare sender_name: string;

	@ApiPropertyOptional({ example: '0987654321' })
	@Column
	declare sender_phone: string;

	@ApiPropertyOptional({ example: '123 Quang Trung' })
	@Column
	declare sender_address: string;

	@ApiPropertyOptional({ example: '10' })
	@Column
	declare sender_ward: string;

	@ApiPropertyOptional({ example: 'Quận 5' })
	@Column
	declare sender_district: string;

	@ApiPropertyOptional({ example: 'TP HCM' })
	@Column
	declare sender_province: string;

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
	declare cancel_reason: string;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm bắt đầu vận chuyển'
	})
	declare delivery_date: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian đơn vị vận chuyển call'
	})
	declare delivery_push_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Chờ vận chuyển'
	})
	declare push_shipping_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm đóng gói'
	})
	declare packaged_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm đang/ chờ đóng gói'
	})
	declare packaging_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Đơn vị vận chuyển lấy hàng'
	})
	declare picked_up_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm giao hàng'
	})
	declare delivery_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian huỷ hàng.'
	})
	declare delivery_canceled_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời gian giao hàng không thành công'
	})
	declare delivery_failed_at: Date;

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
		comment: 'Thời điểm giao thành công'
	})
	declare delivery_success_at: Date;

	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm hoàn tất đơn'
	})
	declare closed_at: Date;

	@ApiPropertyOptional({ example: 'Express' })
	@Column({
		type: DataType.DATE,
		comment: 'Thời điểm Thanh toán'
	})
	declare payment_at: Date;

	@HasMany(() => OrderDeliveryLog)
	order_delivery_logs: OrderDeliveryLog[];

	@HasMany(() => OrderDetail)
	details: OrderDetail[];
}
