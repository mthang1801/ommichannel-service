import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CustomerPointConfig } from 'src/models/customerPointConfig.model';
import { CustomerPointHistory } from 'src/models/customerPointHistory.model';
import { Seller } from 'src/models/seller.model';
import { User } from 'src/models/user.model';
import { CustomerPointConfigService } from 'src/services/customerPointConfig.service';
import { CustomerPointConfigController } from '../controllers/api/customerPointConfig.controller';
import { CustomerModule } from './customer.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([CustomerPointConfig, CustomerPointHistory, Seller, User]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => CustomerModule)],
	controllers: [CustomerPointConfigController],
	providers: [
		CustomerPointConfigService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, CustomerPointConfigService]
})
export class CustomerPointConfigModule {}
