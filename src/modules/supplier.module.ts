import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Province } from 'src/models/province.model';
import { District } from 'src/models/district.model';
import { Ward } from 'src/models/ward.model';
import { SupplierController } from 'src/controllers/api/supplier.controller';
import { SupplierService } from 'src/services/supplier.service';
import { Supplier } from 'src/models/supplier.model';
import { Bank } from 'src/models/bank.model';
import { PaymentMethod } from 'src/models/paymentMethod.model';
import { BankBranch } from 'src/models/bankBranch.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	Supplier,
	Bank,
	BankBranch,
	PaymentMethod,
	Province,
	District,
	Ward
]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [SupplierController],
	providers: [
		SupplierService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class SupplierModule {}
