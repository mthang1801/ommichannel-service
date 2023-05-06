import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { CouponApplyForTypeEnum, PromotionApplyTypeEnum } from 'src/common/constants/enum';
import { Product } from './product.model';
import { PromotionProgram } from './promotionProgram.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'promotion_applied_products',
	underscored: true,
	timestamps: true,
	createdAt: true,
	updatedAt: true,
	indexes: [
		{ unique: true, fields: ['program_id', 'product_id'] },
		{ fields: ['program_id'] },
		{ fields: ['seller_id'] },
		{ fields: ['status'] },
		{ fields: ['start_at', 'end_at'] },
		{ fields: ['start_at', 'end_at'] },
		{ fields: ['product_id'] }
	]
})
export class CouponAppliedProduct extends Model {
	@ApiPropertyOptional({ description: 'Id Chương trình KM' })
	@ForeignKey(() => PromotionProgram)
	@Column({ comment: 'Id Chương trình KM' })
	declare program_id: number;

	@BelongsTo(() => PromotionProgram)
	coupon_program: PromotionProgram;

	@ApiPropertyOptional({ description: 'Id Seller' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Id Seller' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Product Id' })
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@BelongsTo(() => Product)
	product: Product;

	@ApiPropertyOptional({ description: 'Loại KM' })
	@Column({ comment: 'Loại KM; 1: Fixed, 2: Percentage', defaultValue: 1 })
	declare discount_type: number;

	@ApiPropertyOptional({ description: 'giá trị KM' })
	@Column({ type: DataType.DOUBLE, comment: 'giá trị KM' })
	declare discount_amount: number;

	@ApiPropertyOptional({ description: 'giá trị KM tối đa' })
	@Column({ type: DataType.DOUBLE, comment: 'giá trị KM tối đa' })
	declare max_discount_amount: number;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ defaultValue: true, comment: 'Trạng thái hoạt động' })
	declare status: boolean;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@Column({ type: DataType.DATE, comment: 'Ngày bắt đầu' })
	declare start_at: Date;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@Column({ type: DataType.DATE, comment: 'Ngày kết thúc' })
	declare end_at: Date;

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

	@ApiPropertyOptional({ description: 'Điều kiện áp dụng Hoá đơn tối thiểu từ' })
	@Column({ comment: 'Điều kiện áp dụng Hoá đơn tối thiểu từ' })
	declare min_price_from: number;
}
