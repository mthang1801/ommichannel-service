import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { District } from 'src/models/district.model';

@Table({
	tableName: 'm_wards',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Ward extends Model {
	@ForeignKey(() => District)
	@Column({
		allowNull: false
	})
	declare district_id: number;

	@Column({
		type: DataType.STRING(6)
	})
	declare ward_code: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare ward_name: string;

	@Column
	declare ordered: number;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare _status: boolean;

	@BelongsTo(() => District)
	district: District;
}
