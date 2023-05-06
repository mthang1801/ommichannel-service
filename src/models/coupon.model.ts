import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { CouponApplyForTypeEnum, CustomerRankingEnum, PlatformEnum } from 'src/common/constants/enum';
import { Seller } from 'src/models/seller.model';
import { CouponApplication } from './couponApplication.model';
import { CouponDetail } from './couponDetails.model';

@Table({
	tableName: 'coupons',
	underscored: true,
	timestamps: true,
	updatedAt: true,
	paranoid: true,
	indexes: [
		{ fields: ['coupon_code'], unique: true },
		{ fields: ['coupon_name', 'coupon_code'] },
		{ fields: ['coupon_apply_type'] },
		{ fields: ['status'] },
		{ fields: ['created_at', 'updated_at'] },
		{ fields: ['start_at', 'end_at'] }
	]
})
export class Coupon extends Model {
	@ApiPropertyOptional({ description: 'Seller Id' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Seller Id' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Tên chương trình' })
	@Column({ comment: 'Tên chương trình' })
	declare coupon_name: string;

	@ApiPropertyOptional({ description: 'Mã chương trình' })
	@Column({ comment: 'Mã chương trình' })
	declare coupon_code: string;

	@ApiPropertyOptional({ description: 'Mô tả chương trình' })
	@Column({ comment: 'Mô tả chương trình' })
	declare description: string;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@Column({ type: DataType.DATE, comment: 'Ngày bắt đầu' })
	declare start_at: Date;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@Column({ type: DataType.DATE, comment: 'Ngày kết thúc' })
	declare end_at: Date;

	@ApiPropertyOptional({ description: 'Số lượng mã' })
	@Column({ comment: 'Số lượng mã' })
	declare number_of_codes: number;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ defaultValue: true, comment: 'Trạng thái hoạt động' })
	declare status: number;

	@ApiPropertyOptional({
		description: `áp dụng cho ${Object.entries(CouponApplyForTypeEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@Column({
		comment: `áp dụng cho ${Object.entries(CouponApplyForTypeEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	declare coupon_apply_type: number;

	@ApiPropertyOptional({
		description: `Nguồn đơn áp dụng, ${Object.entries(PlatformEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@Column({
		comment: `Nguồn đơn áp dụng, ${Object.entries(PlatformEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	declare utm_sources: string;

	@ApiPropertyOptional({ description: 'Số tiền KM' })
	@Column({ type: DataType.DOUBLE, comment: 'Số tiền KM' })
	declare discount_amount: number;

	@ApiPropertyOptional({ description: 'Loai KM, 1: Tiền, 2: %' })
	@Column({ type: DataType.TINYINT(), defaultValue: 1, comment: 'Loai KM, 1: Tiền, 2: %' })
	declare discount_type: number;

	@ApiPropertyOptional({ description: 'Số tiền KM tối đa' })
	@Column({ type: DataType.DOUBLE, comment: 'Số tiền KM tối đa' })
	declare max_discount_amount: number;

	@ApiPropertyOptional({ description: 'Tổng giá trị KM ' })
	@Column({ type: DataType.DOUBLE, comment: 'giá trị KM ' })
	declare total_discount_amount: number;

	@ApiPropertyOptional({ description: 'Giá trị Giới hạn số lấn sử dụng' })
	@Column({ comment: 'Giá trị Giới hạn số lấn sử dụng' })
	declare max_used: number;

	@ApiPropertyOptional({ description: 'Giới hạn Số lần KH sử dụng tối đa' })
	@Column({ comment: 'Giới hạn Số lần KH sử dụng tối đa' })
	declare customer_max_used: number;

	@ApiPropertyOptional({ description: 'Đơn hàng có giá trị từ' })
	@Column({ comment: 'Đơn hàng có giá trị từ' })
	declare order_price_from: number;

	@ApiPropertyOptional({ description: 'Áp dụng chung với các KM khác' })
	@Column({ comment: 'Áp dụng chung với các KM khác' })
	declare apply_for_other_promotions: boolean;

	@ApiPropertyOptional({
		description: `Loại KH áp dụng ${Object.entries(CustomerRankingEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	@Column({
		comment: `Loại KH áp dụng ${Object.entries(CustomerRankingEnum)
			.map(([key, val]) => `${key} = ${val}`)
			.join(',')}`
	})
	declare apply_for_customer_rankings: string;

	@HasMany(() => CouponDetail)
	coupon_details: CouponDetail[];

	@HasMany(() => CouponApplication)
	coupon_applications: CouponApplication[];
}
