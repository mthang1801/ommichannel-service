import { BelongsTo, BelongsToMany, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Attribute } from 'src/models/attribute.model';
import { Product } from './product.model';
import { ProductVariationAttribute } from './productVariationAttribute.model';

@Table({
	tableName: 'attribute_values',
	timestamps: true,
	updatedAt: true,
	underscored: true,
	paranoid: true
})
export class AttributeValue extends Model {
	@ForeignKey(() => Attribute)
	@Column
	declare attribute_id: number;

	@BelongsTo(() => Attribute)
	attribute: Attribute;

	@Column
	declare value_name: string;

	@Column
	declare value: string;

	@Column
	declare value_code: string;

	@Column({
		defaultValue: 0
	})
	declare index: number;
}
