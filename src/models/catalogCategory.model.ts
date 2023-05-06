import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Catalog } from 'src/models/catalog.model';
import { Category } from 'src/models/category.model';

@Table({
	tableName: 'catalog_categories',
	underscored: true,
	timestamps: true,
	updatedAt: true,	
})
export class CatalogCategory extends Model {
	@ForeignKey(() => Catalog)
	@Column
	declare catalog_id: number;

	@BelongsTo(() => Catalog)
	catalog: Catalog;

	@Column
	declare seller_id: number;

	@ForeignKey(() => Category)
	@Column
	declare category_id: number;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	declare category_index: number;

	@BelongsTo(() => Category)
	category: Category;

	@Column
	declare status: boolean;
}
