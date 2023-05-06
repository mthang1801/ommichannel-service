import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'schedulers',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Scheduler extends Model {
	@Column({
		type: DataType.BIGINT
	})
	declare scheduler_interval: number;

	@Column({
		type: DataType.STRING(256)
	})
	declare description: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;
}
