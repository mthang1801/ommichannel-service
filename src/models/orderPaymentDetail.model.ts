import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from './order.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'order_payment_details',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	paranoid: true
})
export class OrderPaymentDetail extends Model {
	@ForeignKey(() => Order)
	@Column
	declare order_id: number;

	@BelongsTo(() => Order)
	order?: Order;

	@ForeignKey(() => Seller)
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column
	declare payment_method_id: number;

	@Column
	declare payment_method_name: string;

	@Column({
		type: DataType.STRING(64)
	})
	declare payment_code?: string;

	@Column({
		type: DataType.DOUBLE
	})
	declare amount?: number;

	@Column({
		type: DataType.DATE
	})
	declare payment_at?: string;
}
