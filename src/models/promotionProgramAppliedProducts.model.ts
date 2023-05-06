import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PromotionApplyMethodType } from 'src/common/constants/constant';
import { Product } from './product.model';
import { PromotionProgram } from './promotionProgram.model';
import { PromotionProgramEntity } from './promotionProgramEntities.model';
import { PromotionProgramEntityDetail } from './promotionProgramEntityDetail.model';
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
export class PromotionAppliedProduct extends Model {
	@ApiPropertyOptional({ description: 'Id Chương trình KM' })
	@ForeignKey(() => PromotionProgram)
	@Column({ comment: 'Id Chương trình KM' })
	declare program_id: number;

	@BelongsTo(() => PromotionProgram)
	promotion_program: PromotionProgram;

	@ApiPropertyOptional({ description: 'Id Seller' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Id Seller' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Promotion Entity Id' })
	@ForeignKey(() => PromotionProgramEntity)
	@Column
	declare promotion_entity_id: number;

	@BelongsTo(() => PromotionProgramEntity)
	promotion_entity: PromotionProgramEntity;

	@Column
	declare entity_id: number;

	@ApiPropertyOptional({ description: 'Product Id' })
	@ForeignKey(() => Product)
	@Column
	declare product_id: number;

	@BelongsTo(() => Product)
	product: Product;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ defaultValue: true, comment: 'Trạng thái hoạt động' })
	declare status: boolean;

	@ApiPropertyOptional({ description: 'Tổng KM' })
	@Column
	declare max_use_quantity: number;

	@ApiPropertyOptional({ description: 'Số lượng đã sử dụng' })
	@Column({ defaultValue: 0 })
	declare used_quantity: number;

	@ApiPropertyOptional({
		description: Object.entries(PromotionApplyMethodType)
			.map(([key, val]) => `${key}=${val}`)
			.join(', ')
	})
	@Column({
		comment: Object.entries(PromotionApplyMethodType)
			.map(([key, val]) => `${key}=${val}`)
			.join(', ')
	})
	declare apply_method: number;

	@ApiPropertyOptional({ description: 'Nguồn đơn hàng' })
	@Column
	declare utm_sources: string;

	@ApiPropertyOptional({ description: '' })
	@Column
	declare customer_rankings: string;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@Column({ type: DataType.DATE, comment: 'Ngày bắt đầu' })
	declare start_date: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@Column({ type: DataType.DATE, comment: 'Ngày kết thúc' })
	declare end_date: string;

	@ApiPropertyOptional({ description: 'Thời gian bắt đầu' })
	@Column({ type: DataType.TIME, comment: 'Ngày bắt đầu' })
	declare start_at: string;

	@ApiPropertyOptional({ description: 'Thời gian kết thúc' })
	@Column({ type: DataType.TIME, comment: 'Ngày kết thúc' })
	declare end_at: string;

	@ApiPropertyOptional({ description: 'Thứ trong tuần' })
	@Column({ comment: 'Thứ trong tuần' })
	declare days_of_week: string;

	@ApiPropertyOptional({ description: 'Tháng trong năm' })
	@Column({ comment: 'Tháng trong năm' })
	declare months_of_year: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ comment: 'Ngày trong tháng' })
	declare days_of_month: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ type: DataType.TEXT, comment: 'Áp dụng vào những Ngày' })
	declare include_dates: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ type: DataType.TEXT, comment: 'Không Áp dụng vào những Ngày' })
	declare not_include_dates: string;

	@ApiPropertyOptional({ description: 'Áp dụng cho tất cả SP' })
	@Column
	declare apply_all_products: boolean;

	@HasMany(() => PromotionProgramEntityDetail, {
		sourceKey: 'promotion_entity_id',
		foreignKey: 'promotion_entity_id'
	})
	entity_details: PromotionProgramEntityDetail[];


}
