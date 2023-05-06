import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PromotionProgram } from './promotionProgram.model';
import { PromotionProgramEntity } from './promotionProgramEntities.model';
import { Seller } from './seller.model';

@Table({ tableName: 'promotion_entity_details', underscored: true, timestamps: false, updatedAt: false })
export class PromotionProgramEntityDetail extends Model {
	@ApiPropertyOptional({ description: 'Id Entity trong chương trình' })
	@ForeignKey(() => PromotionProgramEntity)
	@Column({ comment: 'Id Entity trong chương trình' })
	declare promotion_entity_id: number;

	@BelongsTo(() => PromotionProgramEntity)
	promotion_entity: PromotionProgramEntity;

	@ApiPropertyOptional({ description: 'Proram Id' })
	@ForeignKey(() => PromotionProgram)
	@Column({ comment: 'Proram Id' })
	declare program_id: number;

	@BelongsTo(() => PromotionProgram)
	promotion_program: PromotionProgram;

	@ApiPropertyOptional({ description: 'Id Seller' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Id Seller' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Số lượng từ' })
	@Column({ defaultValue: 0, comment: 'Số lượng từ' })
	declare quantity_from: number;

	@ApiPropertyOptional({ description: 'Số lượng đến' })
	@Column({ comment: 'Số lượng đến' })
	declare quantity_to: number;

	@ApiPropertyOptional({ description: 'Mức giá từ' })
	@Column({ type: DataType.DOUBLE, defaultValue: 0, comment: 'Mức giá từ' })
	declare total_price_from: number;

	@ApiPropertyOptional({ description: 'Mức giá đến' })
	@Column({ comment: 'Mức giá đến' })
	declare total_price_to: number;

	@ApiPropertyOptional({ description: 'Chiết khấu' })
	@Column({ type: DataType.DOUBLE, comment: 'Chiết khấu' })
	declare discount_amount: number;

	@ApiPropertyOptional({ description: 'Kiểu Chiết khấu' })
	@Column({ defaultValue: 1, comment: 'Kiểu Chiết khấu' })
	declare discount_type: number;

	@ApiPropertyOptional({ description: 'Giới hạn KM' })
	@Column({ comment: 'Giới hạn KM' })
	declare max_use_quantity: number;

	@ApiPropertyOptional({ description: 'SL đã sử dụng' })
	@Column({ comment: 'SL đã sử dụng' })
	declare used_quantity: number;
}
