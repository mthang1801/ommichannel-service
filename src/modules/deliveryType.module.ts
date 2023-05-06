import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { DeliveryTypeController } from 'src/controllers/api/deliveryType.controller';
import { DeliveryTypeService } from 'src/services/deliveryType.service';
import { DeliveryType } from 'src/models/deliveryType.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([DeliveryType]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [DeliveryTypeController],
	providers: [
		DeliveryTypeService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class DeliveryTypeModule {}
