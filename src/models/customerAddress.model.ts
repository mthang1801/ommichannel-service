import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { CustomerAddressTypesEnum } from 'src/common/constants/enum';
import { Customer } from 'src/models/customer.model';

@Table({
	tableName: 'customer_addresses',
	underscored: true,
	timestamps: true,
	updatedAt: true,
	paranoid: true
})
export class CustomerAddress extends Model {
	@ForeignKey(() => Customer)
	@Column
	declare customer_id: number;

	@BelongsTo(() => Customer)
	customer: Customer;

	@Column({ allowNull: false })
	declare fullname: string;

	@Column({ defaultValue: true })
	declare default: boolean;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(CustomerAddressTypesEnum),
		defaultValue: CustomerAddressTypesEnum.Home
	})
	declare address_type: CustomerAddressTypesEnum;

	@Column({
		defaultValue: 1,
		comment: 'Thứ tự của địa chỉ giao hàng'
	})
	declare order_no: number;

	@Column
	declare email: string;

	@Column
	declare phone: string;

	@Column
	declare province_id: number;

	@Column
	declare province_name: string;

	@Column
	declare district_id: number;

	@Column
	declare district_name: string;

	@Column
	declare longitude: string;

	@Column
	declare latitude: string;

	@Column
	declare ward_id: number;

	@Column
	declare ward_name: string;

	@Column
	declare address: string;

	@Column
	declare note: string;
}
