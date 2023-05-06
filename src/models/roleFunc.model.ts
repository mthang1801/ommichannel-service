import { BelongsToMany, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Funct } from 'src/models/funct.model';
import { Role } from 'src/models/role.model';

@Table({ tableName: 'role_functs', timestamps: false })
export class RoleFunct extends Model {
	@ForeignKey(() => Role)
	@Column
	declare role_id: number;

	@ForeignKey(() => Funct)
	@Column
	declare funct_id: number;
}
