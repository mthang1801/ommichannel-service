import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { WarehouseStaffController } from 'src/controllers/api/warehouseStaff.controller';
import { WarehouseStaffService } from 'src/services/warehouseStaff.service';
import { Seller } from 'src/models/seller.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([Seller, WarehouseStaff]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [WarehouseStaffController],
	providers: [
		WarehouseStaffService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class WarehouseStaffModule {}
