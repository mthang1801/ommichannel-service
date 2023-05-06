import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { WardController } from 'src/controllers/common/ward.controller';
import { District } from 'src/models/district.model';
import { Province } from 'src/models/province.model';
import { Ward } from 'src/models/ward.model';
import { WardService } from 'src/services/ward.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([Province, District, Ward]);
@Global()
@Module({
	imports: [internalSequelizeFeatures],
	controllers: [WardController],
	providers: [
		WardService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, WardService]
})
export class WardModule {}
