import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Coupon } from './coupon.model';
import { Seller } from './seller.model';
@Table({
	tableName: 'coupon_applications',
	underscored: true,
	timestamps: false,
	indexes: [{ fields: ['entity_id'] }, { fields: ['coupon_apply_type'] }]
})
export class CouponApplication extends Model {
	@ApiPropertyOptional({ description: 'Seller Id' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Seller Id' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Coupon Id' })
	@ForeignKey(() => Coupon)
	@Column({ comment: 'Seller Id' })
	declare coupon_id: number;

	@BelongsTo(() => Coupon)
	coupon: Coupon;

	@ApiPropertyOptional({ description: 'Id của sản phẩm hoặc danh mục' })
	@Column
	entity_id: number;

	@ApiPropertyOptional({ description: 'Số lượng sản phẩm tối thiểu trong đơn' })
	@Column
	min_product_amount: number;

	@ApiPropertyOptional({ description: '' })
	@Column
	coupon_apply_type: number;
}
