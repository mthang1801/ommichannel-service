import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ProductLevelEnum, ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { Catalog } from 'src/models/catalog.model';
import { Category } from 'src/models/category.model';
import { ProductAttribute } from 'src/models/productAttribute.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { Seller } from 'src/models/seller.model';
import { Unit } from 'src/models/unit.model';
import { User } from 'src/models/user.model';
import { PromotionAppliedProduct } from './promotionProgramAppliedProducts.model';
import { ProductInventory } from './productInventory.model';

@Table({
	tableName: 'products',
	timestamps: true,
	updatedAt: true,
	paranoid: true,
	underscored: true
})
export class Product extends Model {
	@Column
	declare root_id: number;

	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@Column
	declare parent_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@Column
	declare product_name: string;

	@Column
	declare sku: string;

	@Column
	declare unit_id : number;

	@Column
	declare barcode: string;

	@Column
	declare product_name_vat: string;

	@Column
	declare sku_vat: string;

	@Column
	declare vat: string;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare status: boolean;

	@ForeignKey(() => Catalog)
	@Column
	declare catalog_id: number;

	@BelongsTo(() => Catalog)
	catalog: Catalog;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(ProductStatusEnum),
		defaultValue: ProductStatusEnum['Mới']
	})
	declare product_status: ProductStatusEnum;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(ProductTypeEnum),
		defaultValue: ProductTypeEnum.Normal,
		comment: 'Loại sản phẩm'
	})
	declare product_type: ProductTypeEnum;

	@Column({
		type: DataType.ENUM(),
		values: Object.values(ProductLevelEnum),
		defaultValue: ProductLevelEnum.Configure,
		comment: 'Cấp bậc sản phẩm' + Object.keys(ProductLevelEnum).join(', ')
	})
	declare product_level: ProductLevelEnum;

	@Column({ defaultValue: 0 })
	declare virtual_stock_quantity: number;

	@Column({ type: DataType.DOUBLE })
	declare retail_price: number;

	@Column({ type: DataType.DOUBLE })
	declare wholesale_price: number;

	@Column({ type: DataType.DOUBLE })
	declare listed_price: number;

	@Column({ type: DataType.DOUBLE })
	declare return_price: number;

	@Column({ type: DataType.DOUBLE })
	declare import_price: number;

	@Column({ defaultValue: true })
	declare allow_installment: boolean;

	@Column({ type: DataType.TEXT('long') })
	declare description: string;

	@Column({ type: DataType.TEXT })
	declare short_description: string;

	@Column({ type: DataType.TEXT })
	declare other_info: string;

	@Column({ type: DataType.TEXT })
	declare promotion_info: string;

	@Column
	declare video_url: string;

	@Column
	declare thumbnail: string;

	@Column
	declare meta_title: string;

	@Column
	declare meta_keywords: string;

	@Column
	declare meta_image: string;

	@Column
	declare meta_description: string;

	@Column
	declare canonical: string;

	@Column
	declare url: string;

	@Column
	declare redirect_url: string;

	@Column
	declare redirect_type: number;

	@Column
	declare weight: number;

	@Column
	declare length: number;

	@Column
	declare width: number;

	@Column
	declare height: number;

	@Column
	declare specific_attributes: string;

	@Column({ type: DataType.TEXT })
	declare attribute_ids_list: string;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0
	})
	declare index: number;

	@Column
	declare warranty_months: number;

	@Column
	declare warranty_address: string;

	@Column
	declare warranty_phone: string;

	@Column
	declare warranty_note: string;

	@Column
	declare warehouse_ids_list: string;

	@Column({ type: DataType.TEXT })
	declare categories_list: any;

	@Column
	declare root_category_url: number;

	@ForeignKey(() => User)
	@Column
	declare created_by: number;

	@BelongsTo(() => User)
	creator: User;

	@ForeignKey(() => User)
	@Column
	declare updated_by: number;

	@BelongsTo(() => User)
	updater: User;

	@HasMany(() => ProductAttribute)
	attributes: ProductAttribute;

	@BelongsToMany(() => Category, () => ProductCategory)
	categories: Category[];

	@HasMany(() => PromotionAppliedProduct)
	promotions: PromotionAppliedProduct[];

	@HasMany(() => ProductInventory)
	product_inventories : ProductInventory[]
}
