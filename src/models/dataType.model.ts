import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'data_types',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class DataTypes extends Model {
	@Column({
		type: DataType.STRING(128)
	})
	declare data_type: string;
}
