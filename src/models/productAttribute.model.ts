import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Attribute } from 'src/models/attribute.model';
import { AttributeValue } from 'src/models/attributeValue.model';
import { Product } from 'src/models/product.model';
import { DataType } from 'sequelize-typescript';

@Table({
	tableName: 'product_attributes',
	timestamps: true,
	updatedAt: true,
	paranoid: false,
	underscored: true
})
export class ProductAttribute extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@BelongsTo(() => Product)
	product: Product;

	@ForeignKey(() => Attribute)
	@Column
	declare attribute_id: number;

	@BelongsTo(() => Attribute)
	attribute: Attribute;

	@Column({ type: DataType.TEXT })
	declare value_ids: string;

	@Column({ type: DataType.TEXT })
	declare text_value: string;
}
