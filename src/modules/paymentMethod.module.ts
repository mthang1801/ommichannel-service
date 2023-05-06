import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { PaymentMethodController } from 'src/controllers/api/paymentMethod.controller';
import { PaymentMethod } from 'src/models/paymentMethod.model';
import { PaymentMethodService } from 'src/services/paymentMethod.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([PaymentMethod]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [PaymentMethodController],
	providers: [
		PaymentMethodService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class PaymentMethodModule {}
