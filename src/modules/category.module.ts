import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CategoryController } from 'src/controllers/api/category.controller';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { Category } from 'src/models/category.model';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { ProductModule } from 'src/modules/product.module';
import { CategoryService } from 'src/services/category.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	Category,
	CatalogCategory,
	CategoryAttribute,
	ProductCategory
]);

export const categorySequelizeFeatuers = internalSequelizeFeatures;

@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ProductModule)],
	controllers: [CategoryController],
	providers: [
		CategoryService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, CategoryService]
})
export class CategoryModule {}
