import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from './order.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'order_payment_logs',
	timestamps: true,
	underscored: true,
	paranoid: true
})
export class OrderPaymentLog extends Model {
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
	declare payment_status: number;

	@Column
	declare payment_status_name: string;

	@Column({ type: DataType.TEXT })
	declare note: string;
}
