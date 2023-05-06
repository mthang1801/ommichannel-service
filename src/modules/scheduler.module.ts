import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Scheduler } from 'src/models/scheduler.model';
import { SchedulerController } from 'src/controllers/api/scheduler.controller';
import { SchedulerService } from 'src/services/scheduler.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([Scheduler]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [SchedulerController],
	providers: [
		SchedulerService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class SchedulerModule {}
