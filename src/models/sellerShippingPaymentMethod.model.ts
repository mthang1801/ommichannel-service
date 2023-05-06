import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from './seller.model';
import { ShippingUnit } from './shippingUnit.model';

@Table({ tableName: 'seller_shipping_payment_methods', timestamps: true, updatedAt: true, underscored: true })
export class SellerShippingPaymentMethod extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => ShippingUnit)
	@Column
	declare shipping_unit_id: number;

	@BelongsTo(() => ShippingUnit)
	shipping_unit: ShippingUnit;

	@Column({ defaultValue: true })
	declare status: boolean;

	@Column
	payment_method_id: number;

	@Column
	payment_method_name: string;
}
