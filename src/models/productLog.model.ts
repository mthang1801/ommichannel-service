import { BelongsTo, Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { ProductLogDetail } from './productLogDetail.model';

@Table({ tableName: 'product_logs', timestamps: true, underscored: true })
export class ProductLog extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@BelongsTo(() => Product)
	product: Product;

	@Column
	declare module_id: number;

	@Column
	declare module_name: string;

	@Column
	declare log_type_id: number;

	@Column
	declare log_type_name: string;

	@Column
	declare handled_by: string;

	@HasMany(() => ProductLogDetail)
	declare details: ProductLogDetail[];
}
