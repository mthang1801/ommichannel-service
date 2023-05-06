import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'units',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Unit extends Model {
	@Column({
		type: DataType.STRING(128),
		allowNull: false
	})
	declare unit: string;

	@Column({
		allowNull: false,
		defaultValue: 1
	})
	declare status: number;
}
