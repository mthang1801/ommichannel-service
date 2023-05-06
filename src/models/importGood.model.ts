import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { Supplier } from 'src/models/supplier.model';
import { Warehouse } from 'src/models/warehouse.model';
import { ImportGoodDetail } from 'src/models/importGoodDetail.model';

@Table({
	tableName: 'import_goods',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class ImportGood extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({
		type: DataType.STRING(50)
	})
	declare import_good_code: string;

	@ForeignKey(() => Supplier)
	@Column({
		allowNull: false
	})
	declare supplier_id: number;

	@BelongsTo(() => Supplier)
	supplier: Supplier;

	@ForeignKey(() => Warehouse)
	@Column({})
	declare warehouse_id: number;

	@BelongsTo(() => Warehouse)
	warehouse: Warehouse;

	@Column({
		allowNull: false
	})
	declare total_amount: number;

	@Column
	declare paid_amount: number;

	@Column
	declare debit_amount: number;

	@Column({
		allowNull: false,
		defaultValue: 1
	})
	declare transaction_status: number;

	@Column({
		allowNull: false,
		defaultValue: 1
	})
	declare payment_status: number;

	@Column({
		type: DataType.DATE
	})
	declare payment_at: string;

	@Column({
		type: DataType.STRING(128)
	})
	declare payment_by: string;

	@Column({
		allowNull: false,
		defaultValue: 1
	})
	declare payment_method: number;

	@Column({
		type: DataType.STRING(50)
	})
	declare payment_code: string;

	@Column({
		allowNull: false,
		defaultValue: 1
	})
	declare input_status: number;

	@Column({
		type: DataType.DATE
	})
	declare input_at: string;

	@Column({
		type: DataType.STRING(128)
	})
	declare input_by: string;

	@Column({
		type: DataType.STRING(128)
	})
	declare created_by: string;

	@HasMany(() => ImportGoodDetail)
	details: ImportGoodDetail[];
}
