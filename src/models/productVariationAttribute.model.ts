import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { AttributeValue } from 'src/models/attributeValue.model';
import { Product } from 'src/models/product.model';

@Table({
	tableName: 'product_variation_attributes',
	timestamps: false,
	underscored: true
})
export class ProductVariationAttribute extends Model {
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@ForeignKey(() => AttributeValue)
	@Column
	declare value_id: number;
}
