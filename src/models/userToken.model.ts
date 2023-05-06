import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserAccountStatusActionTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { User } from 'src/models/user.model';

@Table({ tableName: 'user_tokens', timestamps: false })
export class UserToken extends Model {
	@ForeignKey(() => User)
	@Column
	declare user_id: number;

	@BelongsTo(() => User)
	declare user: User;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(UserAccountStatusActionTypeEnum),
		comment:
			'1: Kích hoạt tài khoản, 2: Kích hoạt lại tài khoản, 3: Khôi phục lại mật khẩu, 4: Đăng nhập tk google, 5: Đăng nhập tk fb'
	})
	declare type: string;

	@Column
	declare access_token: string;

	@Column
	declare refresh_token: string;

	@Column
	declare secret_key: string;

	@Column({
		type: DataType.TEXT
	})
	declare extra_data: string;

	@Column({ unique: { name: 'provider_id', msg: messages.auth.providerUniqueExist }, allowNull: true })
	declare provider_id: string;

	@Column
	declare expired_at: Date;

	@Column
	declare created_at: Date;
}
