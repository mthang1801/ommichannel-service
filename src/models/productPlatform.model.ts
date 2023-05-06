import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Platform } from 'src/models/platform.model';
import { Product } from 'src/models/product.model';
import { User } from 'src/models/user.model';

@Table({
	tableName: 'product_platforms',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class ProductPlatform extends Model {
	@ForeignKey(() => Product)
	@Column
	product_id: number;

	@ForeignKey(() => Platform)
	@Column
	platform_id: number;

	@Column({
		allowNull: false
	})
	declare product_platform_id: string;

	@Column
	declare barcode: string;

	@Column
	declare sku: string;

	@Column
	declare retail_price: number;

	@Column
	declare wholesale_price: number;

	@Column
	declare listed_price: number;

	@Column
	declare return_price: number;

	@Column
	declare stock_quantity: number;

	@ForeignKey(() => User)
	declare created_by: number;

	@BelongsTo(() => User)
	creator: User;

	@ForeignKey(() => User)
	declare updated_by: number;

	@BelongsTo(() => User)
	updater: User;
}
