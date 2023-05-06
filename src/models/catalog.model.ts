import { ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { Category } from 'src/models/category.model';
import { Product } from 'src/models/product.model';
import { Seller } from './seller.model';
import { SellerCatalog } from './sellerCatalog.model';

@Table({
	tableName: 'catalogs',
	underscored: true,
	timestamps: true,
	paranoid: true
})
export class Catalog extends Model {
	@ApiPropertyOptional({ example: 'Điện thoại' })
	@Column
	declare catalog_name: string;

	@ApiPropertyOptional({ example: true })
	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare status: boolean;

	@ApiPropertyOptional({ example: 1 })
	@Column
	declare index: number;

	@ApiPropertyOptional({
		type: 'array',
		items: { anyOf: [{ $ref: getSchemaPath(Category) }] },
		example: [
			{
				id: 9,
				seller_id: null,
				parent_id: 7,
				category_name: 'iPhone 13 Pro',
				category_image: null,
				description: 'Danh mục điện thoại',
				level: 2,
				status: true,
				id_path: '6/7/9',
				meta_title: 'Điện thoại',
				meta_description: 'Mô tả điện thoại iPhone14',
				meta_keywords: 'dien thoai; iphone 14',
				meta_image: 'file/dien-thoai.png',
				url: 'iphone-13-pro',
				redirect_url: '',
				redirect_type: 300,
				index: 0,
				canonical: 'https://ntlogistics.vn',
				is_default: true,
				createdAt: '2022-10-21T03:33:26.000Z',
				updatedAt: '2022-10-21T03:33:26.000Z',
				CatalogCategory: {
					catalog_id: 100000000,
					category_id: 9
				}
			}
		]
	})
	@HasMany(() => Product)
	products: Product[];

	@HasMany(() => CatalogCategory)
	catalogCategories: CatalogCategory[];

	@BelongsToMany(() => Seller, () => SellerCatalog)
	sellers: Seller[];
}
