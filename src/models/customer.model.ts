import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { CustomerRankingEnum, CustomerTypeEnum, UserGenderEnum } from 'src/common/constants/enum';
import { CustomerAddress } from 'src/models/customerAddress.model';
import { Order } from 'src/models/order.model';
import { Seller } from 'src/models/seller.model';
import { CustomerPointHistory } from './customerPointHistory.model';

@Table({
	tableName: 'customers',
	underscored: true,
	timestamps: true,
	updatedAt: true,
	paranoid: true,
	indexes: [
		{
			name: 'customer_fullname_phone_email',
			fields: ['fullname', 'phone', 'email']
		},
		{
			fields: ['customer_code'],
			unique: true
		}
	]
})
export class Customer extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({ allowNull: false })
	declare fullname: string;

	@Column
	declare email: string;

	@Column
	declare phone: string;

	@Column({ defaultValue: true })
	declare status: boolean;

	@Column
	declare customer_code: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(UserGenderEnum),
		defaultValue: UserGenderEnum.Female
	})
	declare gender: UserGenderEnum;

	@Column({ type: DataType.DATEONLY })
	declare date_of_birth: Date;

	@Column({ defaultValue: 0 })
	declare total_point: number;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(CustomerTypeEnum),
		defaultValue: CustomerTypeEnum.Normal
	})
	declare customer_type: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(CustomerRankingEnum),
		defaultValue: CustomerRankingEnum['Thành viên']
	})
	declare ranking: string;

	@HasMany(() => CustomerAddress)
	shipping_info: CustomerAddress[];

	@HasMany(() => Order)
	orders: Order[];

	@HasMany(() => CustomerPointHistory)
	point_histories: CustomerPointHistory[];
}
