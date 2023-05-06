import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { WarehouseController } from 'src/controllers/api/warehouse.controller';
import { District } from 'src/models/district.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Province } from 'src/models/province.model';
import { Ward } from 'src/models/ward.model';
import { Warehouse } from 'src/models/warehouse.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { WarehouseService } from 'src/services/warehouse.service';
import { ServicePackageModule } from './servicePackage.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	Warehouse,
	Province,
	District,
	Ward,
	WarehouseStaff,
	ProductInventory
]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ServicePackageModule)],
	controllers: [WarehouseController],
	providers: [
		WarehouseService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, WarehouseService]
})
export class WarehouseModule {}
