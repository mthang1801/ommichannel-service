import { ApiPropertyOptional } from '@nestjs/swagger';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderDelivery } from './orderDelivery.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'order_delivery_logs',
	underscored: true,
	timestamps: true
})
export class OrderDeliveryLog extends Model {
	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => Order)
	@Column
	declare order_id: number;

	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => OrderDelivery)
	@Column
	declare order_delivery_id: number;

	@ApiPropertyOptional({ example: 'OMS081122123456' })
	@ForeignKey(() => Order)
	@Column
	declare order_code: string;

	@ApiPropertyOptional({ example: 'PC123782' })
	@Column
	declare delivery_code: string;

	@ApiPropertyOptional({ example: 1 })
	@Column
	declare delivery_status_id: number;

	@ApiPropertyOptional({ example: 'Đã lấy hàng' })
	@Column
	declare delivery_status_name: string;

	@ApiPropertyOptional({ example: 7 })
	@Column
	declare order_status_id: string;

	@ApiPropertyOptional({ example: "Chờ lấy hàng" })
	@Column
	declare order_status_name: string;

	@ApiPropertyOptional({ example: 100000 })
	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare shipping_fee: number;

	@ApiPropertyOptional({ example: 1 })
	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare weight: number;

	@ApiPropertyOptional({ example: 1 })
	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare width: number;

	@ApiPropertyOptional({ example: 1 })
	@Column({ type: DataType.FLOAT, defaultValue: 0 })
	declare height: number;

	@ApiPropertyOptional({ example: 'Description' })
	@Column
	declare description: string;

	@ApiPropertyOptional({ example: 0 })
	@Column
	declare partial: string;

	@ApiPropertyOptional({ example: 'Okela' })
	@Column
	declare notes: string;

	@ApiPropertyOptional({ example: 'Okela' })
	@Column
	declare reason: string;

	@ApiPropertyOptional({ example: 'Vị trí hiện tại' })
	@Column
	declare current_location: string;

	@ApiPropertyOptional({ example: 'Vị trí hiện tại' })
	@Column({ type: DataType.DATE })
	declare delivery_change_status_at: string;

	@ApiPropertyOptional({ example: 'Vị trí hiện tại' })
	@Column({ type: DataType.DATE })
	declare delivery_push_at: string;
}
