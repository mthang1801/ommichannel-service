import { Global, Module } from '@nestjs/common';
import { CronJobService } from 'src/services/cronJob.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/models/product.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Warehouse } from 'src/models/warehouse.model';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { sequelizeProvider } from 'src/common/constants/constant';
import { Sequelize } from 'sequelize-typescript';

const internalSequelizeFeatures = SequelizeModule.forFeature([Product, ProductInventory, Warehouse]);

@Global()
@Module({
	imports: [internalSequelizeFeatures],
	providers: [
		CronJobService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, CronJobService]
})
export class CronJobModule {}
