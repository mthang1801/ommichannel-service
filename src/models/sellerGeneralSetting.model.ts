import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GeneralSettingObjTypeEnum } from 'src/common/constants/enum';
import { Seller } from './seller.model';

@Table({
	tableName: 'seller_general_settings',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class SellerGeneralSetting extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	declare seller: Seller;

	@Column
	declare parent_id: number;

	@Column
	declare origin_id : number; 

	@Column
	declare origin_parent_id : number;

	@Column({
		type: DataType.STRING(255)
	})
	declare obj: string;

	@Column
	declare obj_key: string;

	@Column({ type: DataType.TEXT })
	declare obj_value: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(GeneralSettingObjTypeEnum),
		defaultValue: GeneralSettingObjTypeEnum.text
	})
	declare obj_type: GeneralSettingObjTypeEnum;

	@Column
	declare created_by: number;

	@Column
	declare updated_by: number;
}
