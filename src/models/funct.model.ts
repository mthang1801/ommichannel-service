import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { ModuleFunctionActionTypesEnum } from 'src/common/constants/enum';
import { Role } from 'src/models/role.model';
import { RoleFunct } from 'src/models/roleFunc.model';

@Table({
	tableName: 'functs',
	underscored: true,
	timestamps: true,
	paranoid: true
})
export class Funct extends Model {
	@Column
	declare parent_id: number;

	@Column
	declare method: string;

	@Column({ defaultValue: true })
	declare status: boolean;

	@Column
	declare api_route: string;

	@Column
	declare ui_route: string;

	@Column
	declare mobile_route : string;

	@Column({ defaultValue: 0 })
	declare level: number;

	@Column({ defaultValue: 1 })
	declare index: number;

	@Column
	declare ui_icon: string;

	@Column
	declare active_icon: string;

	@Column
	declare mobile_icon : string;

	@Column
	declare funct_name: string;

	@Column
	declare funct_code: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(ModuleFunctionActionTypesEnum)
	})
	declare action: string;

	@Column
	declare relative_funct_ids: string;

	@Column({ type: DataType.TEXT })
	declare description: string;

	@Column({ defaultValue: false })
	declare only_admin_view: boolean;

	@BelongsToMany(() => Role, () => RoleFunct)
	roles: Role[];
}
