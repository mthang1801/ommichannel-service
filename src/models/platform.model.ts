import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Order } from 'src/models/order.model';

@Table({
	tableName: 'platforms',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Platform extends Model {
	@Column({
		type: DataType.STRING(128)
	})
	declare platform_code: string;

	@Column({
		type: DataType.STRING(128)
	})
	declare platform_name: string;

	@Column({
		type: DataType.TEXT
	})
	declare description: string;

	@Column({
		defaultValue: 1
	})
	declare type: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare created_by: string;

	@Column({
		type: DataType.STRING(128)
	})
	declare updated_by: string;

	@HasMany(() => Order)
	orders: Order[];
}
