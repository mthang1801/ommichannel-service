import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { BankController } from 'src/controllers/api/bank.controller';
import { Bank } from 'src/models/bank.model';
import { BankBranch } from 'src/models/bankBranch.model';
import { BankService } from 'src/services/bank.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([Bank, BankBranch]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [BankController],
	providers: [
		BankService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class BankModule {}
