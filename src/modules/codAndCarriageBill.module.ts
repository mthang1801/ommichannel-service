import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CodAndCarriageBillController } from 'src/controllers/api/codAndCarriageBill.controller';
import { CodAndCarriageBillService } from 'src/services/codAndCarriageBill.service';
import { CodAndCarriageBill } from 'src/models/codAndCarriageBill.model';
import { CodAndCarriageBillLog } from 'src/models/codAndCarriageBillLog.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { Seller } from 'src/models/seller.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	CodAndCarriageBill,
	CodAndCarriageBillLog,
	OrderDelivery,
	Seller
]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [CodAndCarriageBillController],
	providers: [
		CodAndCarriageBillService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class CodAndCarriageBillModule {}
