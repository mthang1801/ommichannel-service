import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Platform } from 'src/models/platform.model';
import { Product } from 'src/models/product.model';
import { Warehouse } from 'src/models/warehouse.model';

@Table({
	tableName: 'product_stock_histories',
	timestamps: true,
	updatedAt: true,
	paranoid: false,
	underscored: true
})
export class ProductStockHistory extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@ForeignKey(() => Platform)
	declare platform_id: number;

	@ForeignKey(() => Warehouse)
	declare warehouse_id: number;

	@Column
	declare product_platform_id: number;

	@Column
	declare old_stock_quantity: number;

	@Column
	declare new_stock_quantity: number;
}
