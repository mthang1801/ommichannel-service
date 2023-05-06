import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { Warehouse } from 'src/models/warehouse.model';
import { User } from 'src/models/user.model';

@Table({
	tableName: 'warehouse_staffs',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class WarehouseStaff extends Model {
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
		allowNull: false
	})
	declare user_id: number;
	@BelongsTo(() => User)
	user_info: User;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;
}
