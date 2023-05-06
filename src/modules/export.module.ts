import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { forwardRef } from '@nestjs/common/utils';
import { ExportController } from 'src/controllers/api/export.controller';
import { ExportService } from 'src/services/export.service';
import { CatalogModule } from './catalog.module';
import { CategoryModule } from './category.module';
import { OrderModule } from './order.module';
import { ProductModule } from './product.module';

@Module({
	imports: [
		forwardRef(() => CategoryModule),
		forwardRef(() => CatalogModule),
		forwardRef(() => ProductModule),
		forwardRef(() => OrderModule)
	],
	providers: [ExportService],
	controllers: [ExportController]
})
export class ExportModule {}
