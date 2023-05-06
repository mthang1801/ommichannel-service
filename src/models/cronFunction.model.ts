import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';
import { DataTypes } from 'src/models/dataType.model';

@Table({
	tableName: 'cron_functions',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class CronFunction extends Model {
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

	@ForeignKey(() => DataTypes)
	@Column({
		allowNull: false
	})
	declare data_type_id: number;

	@BelongsTo(() => DataTypes)
	data_type: DataTypes;

	@Column({
		type: DataType.TEXT
	})
	declare description: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;
}
