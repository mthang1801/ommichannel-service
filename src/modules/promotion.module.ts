import { Module } from '@nestjs/common/decorators';
import { SequelizeModule } from '@nestjs/sequelize';
import { PromotionController } from 'src/controllers/api/promotion.controller';
import { PromotionProgram } from 'src/models/promotionProgram.model';
import { PromotionAppliedProduct } from 'src/models/promotionProgramAppliedProducts.model';
import { PromotionProgramEntity } from 'src/models/promotionProgramEntities.model';
import { PromotionProgramEntityDetail } from 'src/models/promotionProgramEntityDetail.model';
import { PromotionService } from 'src/services/promotion.service';
import { ProductModule } from './product.module';
import { CategoryModule } from './category.module';
import { forwardRef } from '@nestjs/common';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	PromotionProgram,
	PromotionProgramEntity,
	PromotionAppliedProduct,
	PromotionProgramEntityDetail
]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ProductModule), forwardRef(() => CategoryModule)],
	controllers: [PromotionController],
	providers: [PromotionService],
	exports: [PromotionService]
})
export class PromotionModule {}
