import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from 'src/models/product.model';
import { Unit } from 'src/models/unit.model';
import { InventoryReceipt } from 'src/models/inventoryReceipt.model';

@Table({
	tableName: 'inventory_receipt_details',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class InventoryReceiptDetail extends Model {
	@ForeignKey(() => InventoryReceipt)
	@Column({})
	declare inventory_receipt_id: number;
	@BelongsTo(() => InventoryReceipt)
	inventory_receipt: InventoryReceipt;

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

	@ForeignKey(() => Unit)
	@Column({})
	declare unit_id: number;
	@BelongsTo(() => Unit)
	unit: Unit;

	@Column({})
	declare qty_in_stock: number;

	@Column({
		comment: 'Tồn kho thực tế'
	})
	declare real_qty_in_stock: number;

	@Column({
		comment: 'Chênh lệch'
	})
	declare differential: number;
}
