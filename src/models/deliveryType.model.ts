import { Column, Model, Table } from 'sequelize-typescript';

@Table({
	tableName: 'delivery_types',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class DeliveryType extends Model {
	@Column
	declare delivery_type: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;
}
