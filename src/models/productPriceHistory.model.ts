import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Platform } from 'src/models/platform.model';
import { Product } from 'src/models/product.model';

@Table({
	tableName: 'product_price_histories',
	timestamps: true,
	updatedAt: true,
	paranoid: false,
	underscored: true
})
export class ProductPriceHistory extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@ForeignKey(() => Platform)
	declare platform_id: number;

	@Column
	declare product_platform_id: number;

	@Column({ type: DataType.DOUBLE })
	declare old_retail_price: number;

	@Column({ type: DataType.DOUBLE })
	declare old_wholesale_price: number;

	@Column({ type: DataType.DOUBLE })
	declare old_listed_price: number;

	@Column({ type: DataType.DOUBLE })
	declare old_return_price: number;

	@Column({ type: DataType.DOUBLE })
	declare new_retail_price: number;

	@Column({ type: DataType.DOUBLE })
	declare new_wholesale_price: number;

	@Column({ type: DataType.DOUBLE })
	declare new_listed_price: number;

	@Column({ type: DataType.DOUBLE })
	declare new_return_price: number;
}
