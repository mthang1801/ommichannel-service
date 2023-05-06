import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Catalog } from './catalog.model';
import { Seller } from './seller.model';

@Table({ tableName: 'seller_catalogs', timestamps: false, underscored: true })
export class SellerCatalog extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@ForeignKey(() => Catalog)
	@Column
	declare catalog_id: number;
}
