import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'banks',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Bank extends Model {
	@Column({
		type: DataType.STRING(2304)
	})
	declare bank_code: string;

	@Column({
		type: DataType.STRING(2304)
	})
	declare bank_name: string;

	@Column
	declare position: number;

	@Column({
		type: DataType.CHAR(9)
	})
	declare status: string;
}
