import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
	tableName: 'order_statuses',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class OrderStatus extends Model {
	@Column({
		type: DataType.STRING(512),
		allowNull: false
	})
	declare order_status: string;
}
