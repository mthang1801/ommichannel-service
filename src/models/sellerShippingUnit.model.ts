import { Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { SellerShippingPaymentMethod } from './sellerShippingPaymentMethod.model';
import { SellerShippingService } from './sellerShippingService.model';

@Table({
	tableName: 'seller_shipping_units',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	paranoid: true
})
export class SellerShippingUnit extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@ForeignKey(() => ShippingUnit)
	@Column
	declare shipping_unit_id: number;

	@Column({
		defaultValue: false,
		comment: 'Trạng thái kết nối'
	})
	declare connect_status: boolean;

	@Column
	declare code: string;

	@Column({ type: DataType.TEXT })
	declare data: string;

	@Column
	declare last_connected_at: Date;

	@Column
	declare expired_token_at: Date;

	@HasMany(() => SellerShippingService, { sourceKey: 'seller_id', foreignKey: 'seller_id' })
	shipping_services: SellerShippingService[];

	@HasMany(() => SellerShippingPaymentMethod, { sourceKey: 'seller_id', foreignKey: 'seller_id' })
	payment_methods: SellerShippingPaymentMethod[];

	sellerShippingServices: SellerShippingService[];
	sellerShippingPaymentMethods: SellerShippingPaymentMethod[];
}
