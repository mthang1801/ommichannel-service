import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CustomerController } from 'src/controllers/api/customer.controller';
import { Customer } from 'src/models/customer.model';
import { CustomerAddress } from 'src/models/customerAddress.model';
import { CustomerPointHistory } from 'src/models/customerPointHistory.model';
import { CustomerService } from 'src/services/customer.service';
import { ShippingUnitService } from 'src/services/shippingUnit.service';
import { CustomerPointConfigModule } from './customerPointConfig.module';
import { OrderModule } from './order.module';
import { shippingUnitFeaturesRepo } from './shippingUnit.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([Customer, CustomerAddress, CustomerPointHistory]);

@Module({
	imports: [
		internalSequelizeFeatures,
		shippingUnitFeaturesRepo,
		forwardRef(() => OrderModule),
		forwardRef(() => CustomerPointConfigModule)
	],
	controllers: [CustomerController],
	providers: [
		CustomerService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		},

		ShippingUnitService
	],
	exports: [internalSequelizeFeatures, CustomerService]
})
export class CustomerModule {}
