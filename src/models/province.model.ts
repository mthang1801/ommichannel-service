import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { District } from 'src/models/district.model';

@Table({
	tableName: 'm_provinces',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Province extends Model {
	@Column({
		allowNull: true
	})
	declare zone_id: number;

	@Column({
		type: DataType.STRING(128),
		allowNull: true
	})
	declare zone: string;

	@Column({
		type: DataType.STRING(2),
		allowNull: false
	})
	declare province_code: string;

	@Column({
		type: DataType.STRING(256),
		allowNull: false
	})
	declare province_name: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@Column
	declare ordered: number;

	@HasMany(() => District)
	districts: District[];
}
