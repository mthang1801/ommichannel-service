import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ImportGood } from './importGood.model';
import { Product } from './product.model';
import { Unit } from './unit.model';
import { Warehouse } from './warehouse.model';
import { Supplier } from './supplier.model';

@Table({
	tableName: 'import_good_logs',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class ImportGoodLog extends Model {
	@ForeignKey(() => ImportGood)
	@Column({})
	declare import_good_id: number;
	@BelongsTo(() => ImportGood)
	import_good: ImportGood;

	@ForeignKey(() => Warehouse)
	@Column({})
	declare warehouse_id: number;
	@BelongsTo(() => Warehouse)
	warehouse: Warehouse;

	@ForeignKey(() => Supplier)
	@Column({})
	declare supplier_id: number;
	@BelongsTo(() => Supplier)
	supplier: Supplier;

	@Column({
		type: DataType.STRING(50)
	})
	declare sku: string;

	@ForeignKey(() => Product)
	@Column({})
	declare product_id: number;
	@BelongsTo(() => Product)
	_product: Product;

	@Column({
		type: DataType.STRING(256)
	})
	declare product: string;

	@Column({})
	declare qty: number;

	@ForeignKey(() => Unit)
	@Column({})
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

	@Column({
		type: DataType.DATE
	})
	declare imported_at: string;
}
