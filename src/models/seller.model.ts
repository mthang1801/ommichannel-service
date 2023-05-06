import { BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import messages from 'src/common/constants/messages';
import { Attribute } from 'src/models/attribute.model';
import { Category } from 'src/models/category.model';
import { Order } from 'src/models/order.model';
import { Product } from 'src/models/product.model';
import { Role } from 'src/models/role.model';
import { SellerShippingUnit } from 'src/models/sellerShippingUnit.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { User } from 'src/models/user.model';
import { Catalog } from './catalog.model';
import { SellerCatalog } from './sellerCatalog.model';
import { SellerServicePackage } from './sellerServicePackages.model';
import { ServicePackage } from './servicePackage.model';

@Table({
	tableName: 'sellers',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Seller extends Model {
	@Column({ type: DataType.STRING(255), allowNull: false })
	declare seller_name: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		validate: {
			is: /((03|05|07|08|09)+([0-9]{8}))\b|((02)+([0-9]{9}))\b|(^(19)+([0-9]{6,8}))\b|(^(18)+([0-9]){6,8})\b/
		},
		unique: {
			name: 'phone',
			msg: messages.auth.phoneSignupExist
		}
	})
	declare phone: string;

	@Column({
		type: DataType.STRING,
		validate: {
			is: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		},
		allowNull: false,
		unique: {
			name: 'email',
			msg: messages.auth.emailSignupExist
		}
	})
	declare email: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động của tài khoản. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@Column({
		type: DataType.STRING
	})
	declare logo: string;

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
	declare fax: string;

	@Column({ type: DataType.TEXT })
	declare note: string;

	@Column({ type: DataType.TEXT })
	declare catalog_ids: string;

	@HasMany(() => User)
	users: User[];

	@HasMany(() => Role)
	roles: Role[];

	@HasMany(() => Attribute)
	attributes: Attribute[];

	@HasMany(() => Product)
	products: Product[];

	@BelongsToMany(() => ShippingUnit, () => SellerShippingUnit)
	shipping_units: ShippingUnit[];

	@HasMany(() => Order)
	orders: Order[];

	@HasMany(() => Category)
	categories: Category[];

	@BelongsToMany(() => ServicePackage, () => SellerServicePackage)
	service_packages: ServicePackage[];

	@BelongsToMany(() => Catalog, () => SellerCatalog)
	catalogs: Catalog[];
}
