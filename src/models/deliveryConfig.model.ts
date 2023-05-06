import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from './seller.model';
import { Warehouse } from './warehouse.model';

@Table({
	tableName: 'delivery_configs',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class DeliveryConfig extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => Warehouse)
	@Column
	declare warehouse_id: number;

	@Column({ type: DataType.DOUBLE, comment: 'Tiền thu hộ' })
	declare cod: number;

	@Column({ type: DataType.FLOAT })
	declare weight: number;

	@Column({ type: DataType.FLOAT })
	declare length: number;

	@Column({ type: DataType.FLOAT })
	declare width: number;

	@Column({ type: DataType.FLOAT })
	declare height: number;

	@Column
	declare delivery_request: number;

	@Column({ type: DataType.TEXT })
	declare delivery_note: string;

	@Column
	declare created_by: number;

	@Column
	declare updated_by: number;
}
