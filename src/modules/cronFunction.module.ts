import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CronFunction } from 'src/models/cronFunction.model';
import { Seller } from 'src/models/seller.model';
import { Platform } from 'src/models/platform.model';
import { CronFunctionController } from 'src/controllers/api/cronFunction.controller';
import { CronFunctionService } from 'src/services/cronFunction.service';
import { CronFunctionScheduler } from 'src/models/cronFunctionScheduler.model';
import { SellerPlatform } from 'src/models/sellerPlatform.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	CronFunction,
	Seller,
	Platform,
	CronFunctionScheduler,
	SellerPlatform
]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [CronFunctionController],
	providers: [
		CronFunctionService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class CronFunctionModule {}
