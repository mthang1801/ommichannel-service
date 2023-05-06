import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { Warehouse } from 'src/models/warehouse.model';
import { InventoryReceiptStatusEnum } from 'src/common/constants/enum';
import { InventoryReceiptDetail } from 'src/models/inventoryReceiptDetail.model';
import { User } from 'src/models/user.model';

@Table({
	tableName: 'inventory_receipts',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class InventoryReceipt extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;
	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => Warehouse)
	@Column({
		allowNull: false
	})
	declare warehouse_id: number;
	@BelongsTo(() => Warehouse)
	warehouse: Warehouse;

	@ForeignKey(() => User)
	@Column({
		comment: 'Nhân viên kiểm hàng'
	})
	declare inventory_staff_id: number;
	@BelongsTo(() => User)
	inventory_staff: User;

	@Column({
		type: DataType.DATE,
		comment: 'Ngày kiểm hàng'
	})
	inventory_at: string;

	// @ForeignKey(() => WarehouseStaff)
	@Column({
		comment: 'Nhân viên cân bằng'
	})
	declare balance_staff_id: number;
	// @BelongsTo(() => WarehouseStaff)
	// balance_staff: WarehouseStaff;

	@Column({
		type: DataType.DATE,
		comment: 'Ngày cân bằng'
	})
	balance_at: string;

	@Column({
		type: DataType.TEXT
	})
	declare note: string;

	@Column({
		defaultValue: InventoryReceiptStatusEnum['Chờ kiểm hàng'],
		comment: 'Trạng thái - 1: Đang kiểm hàng, 2: Đã kiểm hàng, 3: Đã huỷ'
	})
	declare status: number;

	@Column({
		type: DataType.STRING
	})
	declare created_by: string;

	@HasMany(() => InventoryReceiptDetail)
	details: InventoryReceiptDetail[];
}
