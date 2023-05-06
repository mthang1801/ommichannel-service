import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeliveryConfigController } from 'src/controllers/api/deliveryConfig.controller';
import { DeliveryConfig } from 'src/models/deliveryConfig.model';
import { DeliveryConfigService } from 'src/services/deliveryConfig.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([DeliveryConfig]);
@Module({
	imports: [internalSequelizeFeatures],
	controllers: [DeliveryConfigController],
	providers: [DeliveryConfigService],
	exports: [DeliveryConfigService]
})
export class DeliveryConfigModule {}
