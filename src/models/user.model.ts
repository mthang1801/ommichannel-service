import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { UserGenderEnum, UserTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { Bank } from 'src/models/bank.model';
import { BankBranch } from 'src/models/bankBranch.model';
import { Product } from 'src/models/product.model';
import { Seller } from 'src/models/seller.model';
import { UserRole } from 'src/models/userRole.model';
import { UserToken } from 'src/models/userToken.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';

@Table({
	tableName: 'users',
	updatedAt: true,
	underscored: true
})
export class User extends Model {
	@Column({
		type: DataType.STRING(255),
		allowNull: false
	})
	declare fullname: string;

	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động của tk'
	})
	declare status: boolean;

	@Column({
		defaultValue: false,
		comment: 'Tài khoản đã được kích hoạt hay chưa'
	})
	declare has_activated: boolean;

	@Column({ defaultValue: UserTypeEnum.vendor })
	declare user_type: number;

	@Column({
		allowNull: false,
		type: DataType.STRING,
		unique: {
			name: 'email',
			msg: messages.auth.emailSignupExist
		}
	})
	declare email: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		unique: {
			name: 'phone',
			msg: messages.auth.phoneSignupExist
		}
	})
	declare phone: string;

	@Column({ type: DataType.STRING(256) })
	declare password: string;

	@Column({ type: DataType.STRING(20), validate: { len: [0, 10] } })
	declare salt: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(UserGenderEnum),
		defaultValue: UserGenderEnum.Female
	})
	declare gender: string;

	@Column({ type: DataType.DATEONLY })
	declare date_of_birth: string;

	@Column({ type: DataType.TEXT })
	declare avatar: string;

	@Column({ type: DataType.STRING(128), defaultValue: 'Việt Nam' })
	declare country_name: string;

	@Column
	declare country_id: number;

	@Column({ type: DataType.STRING(128) })
	declare province_name: string;

	@Column
	declare province_id: number;

	@Column({ type: DataType.STRING(128) })
	declare district_name: string;

	@Column
	declare district_id: number;

	@Column({ type: DataType.STRING(128) })
	declare ward_name: string;

	@Column
	declare ward_id: number;

	@Column
	declare address: string;

	@Column
	declare zipcode: number;

	@ForeignKey(() => Bank)
	@Column
	declare bank_id: number;

	@ForeignKey(() => BankBranch)
	@Column
	declare bank_branch_id: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare account_number: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare account_name: string;

	@Column({ type: DataType.DATE })
	declare last_login_at: string;

	@Column
	declare createdBy: string;

	@Column
	declare updatedBy: string;

	@HasMany(() => UserToken)
	user_tokens: UserToken[];

	@HasMany(() => WarehouseStaff)
	warehouse_staffs: WarehouseStaff[];

	@HasOne(() => UserRole)
	userRole: UserRole;

	@HasMany(() => Product, 'created_by')
	created_products: Product[];

	@HasMany(() => Product, 'updated_by')
	updated_products: Product[];
}
