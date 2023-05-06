import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common/decorators';
import { SequelizeModule } from '@nestjs/sequelize';
import { CatalogController } from 'src/controllers/api/catalog.controller';
import { Catalog } from 'src/models/catalog.model';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { SellerCatalog } from 'src/models/sellerCatalog.model';
import { CatalogService } from 'src/services/catalog.service';
import { CategoryModule, categorySequelizeFeatuers } from './category.module';

const initialSequelizeFeatures = SequelizeModule.forFeature([Catalog, CatalogCategory, SellerCatalog]);

@Module({
	imports: [initialSequelizeFeatures, categorySequelizeFeatuers, forwardRef(() => CategoryModule)],
	providers: [CatalogService],
	controllers: [CatalogController],
	exports: [CatalogService]
})
export class CatalogModule {}
