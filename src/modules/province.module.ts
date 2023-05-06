import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { ProvinceService } from 'src/services/province.service';
import { Province } from 'src/models/province.model';
import { District } from 'src/models/district.model';
import { Ward } from 'src/models/ward.model';
import { ProvinceController } from 'src/controllers/common/province.controller';

const internalSequelizeFeatures = SequelizeModule.forFeature([Province, District, Ward]);
@Global()
@Module({
	imports: [internalSequelizeFeatures],
	controllers: [ProvinceController],
	providers: [
		ProvinceService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, ProvinceService]
})
export class ProvinceModule {}
