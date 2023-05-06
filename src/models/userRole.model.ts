import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Role } from 'src/models/role.model';
import { User } from 'src/models/user.model';

@Table({ tableName: 'user_roles', timestamps: true, underscored: true })
export class UserRole extends Model {
	@ForeignKey(() => User)
	@Column
	declare user_id: number;

	@BelongsTo(() => User)
	user: User;

	@ForeignKey(() => Role)
	@Column
	declare role_id: number;

	@Column
	declare display: boolean;

	@BelongsTo(() => Role)
	role: Role;
}
