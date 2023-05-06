import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Province } from 'src/models/province.model';
import { District } from 'src/models/district.model';
import { Ward } from 'src/models/ward.model';
import { DistrictService } from 'src/services/district.service';
import { DistrictController } from 'src/controllers/common/district.controller';

const internalSequelizeFeatures = SequelizeModule.forFeature([Province, District, Ward]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [DistrictController],
	providers: [
		DistrictService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, DistrictService]
})
export class DistrictModule {}
