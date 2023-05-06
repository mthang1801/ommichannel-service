import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { DataTypes } from 'src/models/dataType.model';
import { DataTypeController } from 'src/controllers/api/dataType.controller';
import { DataTypeService } from 'src/services/dataType.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([DataTypes]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [DataTypeController],
	providers: [
		DataTypeService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class DataTypeModule {}
