import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';

@Table({
	tableName: 'seller_platforms',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class SellerPlatform extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => Platform)
	@Column({
		allowNull: false
	})
	declare platform_id: number;

	@BelongsTo(() => Platform)
	platform: Platform;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@Column({
		defaultValue: false,
		comment: 'Trạng thái khoá. 1 : bị khoá, 0: không bị khoá'
	})
	declare locked: boolean;

	@Column({
		type: DataType.STRING(128)
	})
	declare locked_by: string;
}
