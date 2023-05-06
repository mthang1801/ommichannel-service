import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { PlatformController } from 'src/controllers/api/platform.controller';
import { Platform } from 'src/models/platform.model';
import { PlatformService } from 'src/services/platform.service';
import { ServicePackageModule } from './servicePackage.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([Platform]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ServicePackageModule)],
	controllers: [PlatformController],
	providers: [
		PlatformService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class PlatformModule {}
