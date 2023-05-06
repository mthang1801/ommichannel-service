import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from 'src/models/order.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'order_status_logs',
	timestamps: true,
	updatedAt: false,
	underscored: true,
	paranoid: true
})
export class OrderStatusLog extends Model {
	@ForeignKey(() => Order)
	@Column
	declare order_id: number;

	@BelongsTo(() => Order)
	order: Order;

	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column
	declare order_status_id: number;

	@Column
	declare order_status_name: string;

	@Column({ type: DataType.TEXT })
	declare note: string;

	@Column
	declare handled_by: number;
}
