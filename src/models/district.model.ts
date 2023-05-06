import { Table, Model, Column, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Province } from 'src/models/province.model';
import { Ward } from 'src/models/ward.model';

@Table({
	tableName: 'm_districts',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class District extends Model {
	@ForeignKey(() => Province)
	@Column({
		allowNull: false
	})
	declare province_id: number;

	@Column({
		type: DataType.STRING(5)
	})
	declare district_code: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare district_name: string;

	@Column
	declare ordered: number;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare _status: boolean;

	@BelongsTo(() => Province)
	province: Province;

	@HasMany(() => Ward)
	districts: Ward[];
}
