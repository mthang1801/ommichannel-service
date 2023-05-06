import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Seller } from 'src/models/seller.model';
import { InventoryReceiptController } from 'src/controllers/api/inventoryReceipt.controller';
import { InventoryReceiptService } from 'src/services/inventoryReceipt.service';
import { InventoryReceipt } from 'src/models/inventoryReceipt.model';
import { InventoryReceiptDetail } from 'src/models/inventoryReceiptDetail.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Warehouse } from 'src/models/warehouse.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { CronJobModule } from 'src/modules/cronJob.module';
import { WarehouseService } from 'src/services/warehouse.service';
import { ServicePackageService } from 'src/services/servicePackage.service';
import { UserModule } from 'src/modules/user.module';
import { BenefitPackage } from 'src/models/benefitPackage';
import { ServiceBenefitPackage } from 'src/models/serviceBenefitPackage.model';
import { ServicePackage } from 'src/models/servicePackage.model';
import { SellerServicePackage } from 'src/models/sellerServicePackages.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	InventoryReceipt,
	Seller,
	InventoryReceiptDetail,
	ProductInventory,
	Warehouse,
	WarehouseStaff,
	BenefitPackage,
	ServiceBenefitPackage,
	ServicePackage,
	SellerServicePackage
]);

@Module({
	imports: [
		internalSequelizeFeatures,
		forwardRef(() => CronJobModule),
		internalSequelizeFeatures,
		forwardRef(() => UserModule)
	],
	controllers: [InventoryReceiptController],
	providers: [
		InventoryReceiptService,
		WarehouseService,
		ServicePackageService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class InventoryReceiptModule {}
