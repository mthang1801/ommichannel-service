import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { ProductController } from 'src/controllers/api/product.controller';
import { Product } from 'src/models/product.model';
import { ProductAttribute } from 'src/models/productAttribute.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { ProductLog } from 'src/models/productLog.model';
import { ProductLogDetail } from 'src/models/productLogDetail.model';
import { ProductPlatform } from 'src/models/productPlatform.model';
import { ProductPriceHistory } from 'src/models/productPriceHistory.model';
import { ProductStockHistory } from 'src/models/productStockHistories.model';
import { ProductVariationAttribute } from 'src/models/productVariationAttribute.model';
import { CategoryModule } from 'src/modules/category.module';
import { ProductService } from 'src/services/product.service';
import { CatalogModule } from './catalog.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	ProductVariationAttribute,
	Product,
	ProductPlatform,
	ProductPriceHistory,
	ProductStockHistory,
	ProductAttribute,
	ProductCategory,
	ProductLog,
	ProductLogDetail
]);

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => CategoryModule)],
	controllers: [ProductController],
	providers: [
		ProductService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, ProductService]
})
export class ProductModule {}
