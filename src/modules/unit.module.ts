import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { UnitController } from 'src/controllers/api/unit.controller';
import { UnitService } from 'src/services/unit.service';
import { Unit } from 'src/models/unit.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([Unit]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [UnitController],
	providers: [
		UnitService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class UnitModule {}
