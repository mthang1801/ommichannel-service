import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { OrderStatusController } from 'src/controllers/api/orderStatus.controller';
import { OrderStatusService } from 'src/services/orderStatus.service';
import { OrderStatus } from 'src/models/orderStatus.model';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';

const internalSequelizeFeatures = SequelizeModule.forFeature([OrderStatus]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [OrderStatusController],
	providers: [
		OrderStatusService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class OrderStatusModule {}
