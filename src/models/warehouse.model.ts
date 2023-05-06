import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { District } from 'src/models/district.model';
import { Order } from 'src/models/order.model';
import { Province } from 'src/models/province.model';
import { Seller } from 'src/models/seller.model';
import { Ward } from 'src/models/ward.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { vietNamesePhoneValidation } from 'src/utils/functions.utils';

@Table({
	tableName: 'warehouses',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Warehouse extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({
		type: DataType.STRING(256)
	})
	declare warehouse_code: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare warehouse_name: string;

	@Column({
		type: DataType.STRING(512)
	})
	declare full_address: string;

	@Column({
		type: DataType.STRING(255)
	})
	declare address: string;

	@ForeignKey(() => Province)
	@Column
	declare province_id: number;
	@BelongsTo(() => Province)
	province: Province;

	@ForeignKey(() => District)
	@Column
	declare district_id: number;
	@BelongsTo(() => District)
	district: District;

	@ForeignKey(() => Ward)
	@Column
	declare ward_id: number;
	@BelongsTo(() => Ward)
	ward: Ward;

	@Column
	declare province_name: string;

	@Column
	declare district_name: string;

	@Column
	declare ward_name: string;

	@Column
	declare longitude: string;

	@Column
	declare latitude: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		validate: {
			is: vietNamesePhoneValidation
		}
	})
	declare phone: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@Column({
		defaultValue: 0
	})
	declare qty_in_stock: number;

	@HasMany(() => Order)
	orders: Order[];

	@HasMany(() => WarehouseStaff)
	warehouse_staff: WarehouseStaff[];
}
