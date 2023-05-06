import { ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Attribute } from 'src/models/attribute.model';
import { Catalog } from 'src/models/catalog.model';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { Product } from 'src/models/product.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { Seller } from 'src/models/seller.model';

@Table({
	tableName: 'categories',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Category extends Model {
	@ApiPropertyOptional()
	@Column
	declare root_id: number;

	@ApiPropertyOptional()
	@Column
	declare root_parent_id: number;

	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ example: 1 })
	@Column
	declare parent_id: number;

	@ApiPropertyOptional({ example: 'Điện thoại' })
	@Column
	declare category_name: string;

	@ApiPropertyOptional({ example: 'file/dien-thoai' })
	@Column
	declare category_image: string;

	@ApiPropertyOptional({ example: 'Mô tả Điện thoại' })
	@Column({
		type: DataType.TEXT
	})
	declare description: string;

	@ApiPropertyOptional({ example: 0 })
	@Column({
		defaultValue: 0
	})
	declare level: number;

	@ApiPropertyOptional({ example: true })
	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@ApiPropertyOptional({ example: '0/1/2/3' })
	@Column
	declare id_path: string;

	@ApiPropertyOptional({ example: 'Số lượng SP' })
	@Column({ defaultValue: 0 })
	declare product_count: number;

	@ApiPropertyOptional({ example: 'Điện thoại' })
	@Column
	declare meta_title: string;

	@ApiPropertyOptional({ example: 'Điện thoại' })
	@Column
	declare meta_description: string;

	@ApiPropertyOptional({ example: 'Điện thoại' })
	@Column
	declare meta_keywords: string;

	@ApiPropertyOptional({ example: 'file/dien-thoai' })
	@Column
	declare meta_image: string;

	@ApiPropertyOptional({ example: 'dien-thoai' })
	@Column
	declare url: string;

	@ApiPropertyOptional({ example: 'dien-thoai-redirect' })
	@Column
	declare redirect_url: string;

	@ApiPropertyOptional({ example: 301 })
	@Column
	declare redirect_type: number;

	@ApiPropertyOptional({ example: 'https://ntlogistics.vn' })
	@Column
	declare canonical: string;

	@ApiPropertyOptional({
		example: false,
		description: 'true nếu thiết lập mặc định (admin thiết lập)'
	})
	@Column({ defaultValue: false })
	declare is_default: boolean;

	@ApiPropertyOptional({
		example: '1,2,3,4,5'
	})
	@Column
	declare catalogs_list: string;

	@ApiPropertyOptional({
		type: 'array',
		items: { allOf: [{ $ref: getSchemaPath(Catalog) }] }
	})
	@HasMany(() => CatalogCategory)
	catalogCatagories: CatalogCategory[];

	@BelongsToMany(() => Product, () => ProductCategory)
	products: Product[];

	@BelongsToMany(() => Attribute, () => CategoryAttribute)
	attributes: Attribute[];
}
