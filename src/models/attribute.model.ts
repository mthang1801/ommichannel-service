import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { AttributeFilterTypeEnum, AttributePurposeEnum, AttributeTypeEnum } from 'src/common/constants/enum';
import { AttributeValue } from 'src/models/attributeValue.model';
import { Category } from 'src/models/category.model';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { Seller } from 'src/models/seller.model';

@Table({
	tableName: 'attributes',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	paranoid: true
})
export class Attribute extends Model {
	@Column
	declare attribute_name: string;

	@Column
	declare attribute_code: string;

	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({type : DataType.TEXT})
	declare categories_list : string;

	@Column({ defaultValue: true })
	declare status: boolean;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(AttributePurposeEnum),
		defaultValue: AttributePurposeEnum.VariationsAsSeperateProducts
	})
	declare purposes: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(AttributeTypeEnum),
		defaultValue: AttributeTypeEnum.TextOrNumber
	})
	declare attribute_type: string;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(AttributeFilterTypeEnum),
		defaultValue: AttributeFilterTypeEnum.DataSelector
	})
	declare filter_type: string;

	@HasMany(() => AttributeValue)
	values: AttributeValue[];

	@BelongsToMany(() => Category, () => CategoryAttribute)
	categories: Category[];
}
