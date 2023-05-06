import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from './seller.model';
import { ShippingUnit } from './shippingUnit.model';

@Table({ tableName: 'seller_shipping_services', timestamps: true, updatedAt: true, underscored: true })
export class SellerShippingService extends Model {
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
	delivery_service_id: number;

	@Column
	delivery_service_name: string;
}
