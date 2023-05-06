import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Coupon } from './coupon.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'coupon_details',
	underscored: true,
	timestamps: true,
	indexes: [{ fields: ['coupon_detail_code'], unique: true }, { fields: ['status'] }, { fields: ['created_at'] }]
})
export class CouponDetail extends Model {
	@ApiPropertyOptional({ description: 'Seller Id' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Seller Id' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Coupon id' })
	@ForeignKey(() => Coupon)
	@Column({ comment: 'Coupon id' })
	declare coupon_id: number;

	@BelongsTo(() => Coupon)
	coupon: Coupon;

	@ApiPropertyOptional({ description: 'Mã coupon' })
	@Column({ comment: 'Mã coupon' })
	declare coupon_detail_code: string;

	@ApiPropertyOptional({ description: 'Trạng thái' })
	@Column({ comment: 'Trạng thái', defaultValue: true })
	declare status: boolean;

	@ApiPropertyOptional({ description: 'Đã dùng' })
	@Column({ comment: 'Đã dùng', defaultValue: 0 })
	declare used: number;

	@ApiPropertyOptional({ description: 'Đã dùng' })
	@Column({ comment: 'Đã dùng', defaultValue: 0 })
	declare remain: number;
}
