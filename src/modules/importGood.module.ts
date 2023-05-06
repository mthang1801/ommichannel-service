import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { Supplier } from 'src/models/supplier.model';
import { Seller } from 'src/models/seller.model';
import { Warehouse } from 'src/models/warehouse.model';
import { ImportGood } from 'src/models/importGood.model';
import { ImportGoodController } from 'src/controllers/api/importGood.controller';
import { ImportGoodService } from 'src/services/importGood.service';
import { ImportGoodDetail } from 'src/models/importGoodDetail.model';
import { Product } from 'src/models/product.model';
import { ImportGoodLog } from 'src/models/importGoodLogs.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { ProductModule } from './product.module';
import { WarehouseService } from 'src/services/warehouse.service';
import { SupplierService } from 'src/services/supplier.service';
import { ServicePackageService } from 'src/services/servicePackage.service';
import { BenefitPackage } from 'src/models/benefitPackage';
import { ServiceBenefitPackage } from 'src/models/serviceBenefitPackage.model';
import { ServicePackage } from 'src/models/servicePackage.model';
import { SellerServicePackage } from 'src/models/sellerServicePackages.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	ImportGood,
	Seller,
	Supplier,
	Warehouse,
	ImportGoodDetail,
	ImportGoodLog,
	Product,
	ProductInventory,
	BenefitPackage,
	ServiceBenefitPackage,
	ServicePackage,
	SellerServicePackage
]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ProductModule)],
	controllers: [ImportGoodController],
	providers: [
		ImportGoodService,
		WarehouseService,
		SupplierService,
		ServicePackageService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class ImportGoodModule {}
