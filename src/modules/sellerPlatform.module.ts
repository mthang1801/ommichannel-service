import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { SellerPlatform } from 'src/models/sellerPlatform.model';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';
import { SellerPlatformController } from 'src/controllers/api/sellerPlatform.controller';
import { SellerPlatformService } from 'src/services/sellerPlatform.service';
import { CronFunction } from 'src/models/cronFunction.model';
import { Scheduler } from 'src/models/scheduler.model';
import { CronFunctionScheduler } from 'src/models/cronFunctionScheduler.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	SellerPlatform,
	Seller,
	Platform,
	CronFunction,
	Scheduler,
	CronFunctionScheduler
]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [SellerPlatformController],
	providers: [
		Object,
		SellerPlatformService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class SellerPlatformModule {}
