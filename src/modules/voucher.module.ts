import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Seller } from 'src/models/seller.model';
import { Voucher } from 'src/models/voucher.model';
import { VoucherController } from 'src/controllers/api/voucher.controller';
import { VoucherService } from 'src/services/voucher.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([Seller, Voucher]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [VoucherController],
	providers: [
		VoucherService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class VoucherModule {}
