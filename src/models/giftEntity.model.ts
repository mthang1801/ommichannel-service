import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PromotionProgram } from './promotionProgram.model';
import { PromotionAppliedProduct } from './promotionProgramAppliedProducts.model';
import { PromotionProgramEntityDetail } from './promotionProgramEntityDetail.model';
import { Seller } from './seller.model';

@Table({ tableName: 'gift_entities', underscored: true, timestamps: true, updatedAt: true })
export class PromotionProgramEntity extends Model {
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

	@ApiPropertyOptional({ description: 'Entity id' })
	@Column
	entity_id: number;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ comment: 'Trạng thái hoạt động', defaultValue: true })
	declare status: boolean;

	@ApiPropertyOptional({ description: 'Phương thức áp dụng' })
	@Column({ comment: 'Phương thức áp dụng', defaultValue: true })
	declare apply_method: number;

	@HasMany(() => PromotionAppliedProduct)
	apply_products: PromotionAppliedProduct[];

	@HasMany(() => PromotionProgramEntityDetail)
	details: PromotionProgramEntityDetail[];
}
