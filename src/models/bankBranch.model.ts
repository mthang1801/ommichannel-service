import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'bank_branchs',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class BankBranch extends Model {
	@Column({
		type: DataType.STRING(765)
	})
	declare bank_code: string;

	@Column({
		type: DataType.STRING(765)
	})
	declare branch_code: string;

	@Column({
		type: DataType.STRING(2304)
	})
	declare branch_name: string;

	@Column
	declare position: number;

	@Column({
		type: DataType.CHAR(9)
	})
	declare status: string;
}
