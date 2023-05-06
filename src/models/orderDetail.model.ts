import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DiscountTypeEnum } from 'src/common/constants/enum';
import { Order } from 'src/models/order.model';
import { Product } from 'src/models/product.model';
import { OrderDelivery } from './orderDelivery.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'order_details',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	paranoid: true
})
export class OrderDetail extends Model {
	@ForeignKey(() => Order)
	@Column
	declare order_id: number;

	@BelongsTo(() => Order)
	order: Order;

	@ForeignKey(() => OrderDelivery)
	declare order_delivery_id: number;

	@BelongsTo(() => OrderDelivery)
	order_delivery: OrderDelivery;

	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({
		type: DataType.STRING(50),
		allowNull: false
	})
	declare sku: string;

	@Column
	declare barcode: string;

	@ForeignKey(() => Product)
	@Column({
		allowNull: false
	})
	declare product_id: number;

	@BelongsTo(() => Product)
	product: Product;

	@Column({
		type: DataType.STRING(256),
		allowNull: false
	})
	declare product_name: string;

	@Column({
		allowNull: false,
		defaultValue: 0
	})
	declare quantity: number;

	@Column({
		type: DataType.DOUBLE
	})
	declare price: number;

	@Column({
		type: DataType.FLOAT,
		defaultValue: 0
	})
	declare discount: number;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(DiscountTypeEnum),
		defaultValue: DiscountTypeEnum.Fixed
	})
	declare discount_type: DiscountTypeEnum;

	@Column({
		type: DataType.DOUBLE
	})
	declare total_money_amount: number;

	@Column({
		type: DataType.DOUBLE
	})
	declare final_total_money_amount: number;
}
