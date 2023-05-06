import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { PathUrlObjectTypeEnum } from 'src/common/constants/enum';

@Table({
	tableName: 'path_urls',
	timestamps: true,
	updatedAt: false,
	paranoid: true
})
export class PathUrl extends Model {
	@Column
	declare object_id: number;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(PathUrlObjectTypeEnum)
	})
	@Column
	declare object_type: string;

	@Column
	declare path_url: string;

	@Column
	declare index: number;

	@Column
	declare offset_width: number;

	@Column
	declare offset_height: number;
}
