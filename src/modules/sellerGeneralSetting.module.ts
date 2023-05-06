import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellerGeneralSettingController } from 'src/controllers/api/sellerGeneralSetting.controller';
import { SellerGeneralSetting } from 'src/models/sellerGeneralSetting.model';
import { SellerGeneralSettingService } from 'src/services/sellerGeneralSetting.service';
const internalSequelizeFeatures = SequelizeModule.forFeature([SellerGeneralSetting]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [SellerGeneralSettingController],
	providers: [SellerGeneralSettingService],
	exports: [SellerGeneralSettingService]
})
export class SellerGeneralSettingModule {}
