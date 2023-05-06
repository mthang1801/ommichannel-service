import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { Product } from 'src/models/product.model';
import { Warehouse } from 'src/models/warehouse.model';

@Table({
	tableName: 'product_inventory',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class ProductInventory extends Model {
	@ForeignKey(() => Seller)
	@Column({})
	declare seller_id: number;
	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => Warehouse)
	@Column({
		allowNull: false
	})
	declare warehouse_id: number;
	@BelongsTo(() => Warehouse)
	warehouse: Warehouse;

	@ForeignKey(() => Product)
	@Column({
		allowNull: false
	})
	declare product_id: number;
	@BelongsTo(() => Product)
	product: Product;

	@Column({
		defaultValue: 0
	})
	declare qty: number;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;
}
