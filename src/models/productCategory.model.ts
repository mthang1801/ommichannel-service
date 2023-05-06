import { Column, ForeignKey, HasMany, Model, Table, BelongsTo } from 'sequelize-typescript';
import { Category } from 'src/models/category.model';
import { Product } from 'src/models/product.model';

@Table({
	tableName: 'product_categories',
	underscored: true,
	timestamps: true
})
export class ProductCategory extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@ForeignKey(() => Category)
	@Column
	declare category_id: number;

	@Column({ defaultValue: 9999 })
	declare index: number;

	@BelongsTo(() => Product)
	product : Product;
}
