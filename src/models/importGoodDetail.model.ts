import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ImportGood } from 'src/models/importGood.model';
import { Product } from 'src/models/product.model';
import { Unit } from 'src/models/unit.model';

@Table({
	tableName: 'import_good_details',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class ImportGoodDetail extends Model {
	@ForeignKey(() => ImportGood)
	@Column({
		allowNull: false
	})
	declare import_good_id: number;

	@BelongsTo(() => ImportGood)
	import_good: ImportGood;

	@Column({
		type: DataType.STRING(50),
		allowNull: false
	})
	declare sku: string;

	@ForeignKey(() => Product)
	@Column({
		allowNull: false
	})
	declare product_id: number;

	@BelongsTo(() => Product)
	_product: Product;

	@Column({
		type: DataType.STRING(256),
		allowNull: false
	})
	declare product: string;

	@Column({
		allowNull: false
	})
	declare qty: number;

	@ForeignKey(() => Unit)
	@Column({
		allowNull: false
	})
	declare unit_id: number;

	@BelongsTo(() => Unit)
	unit: Unit;

	@Column({
		type: DataType.DOUBLE
	})
	declare price: number;

	@Column({
		type: DataType.DOUBLE
	})
	declare total_price: number;
}
