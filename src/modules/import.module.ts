import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { forwardRef } from '@nestjs/common/utils';
import { ImportController } from 'src/controllers/api/import.controller';
import { ImportService } from 'src/services/import.service';
import { CatalogModule } from './catalog.module';
import { CategoryModule } from './category.module';
import { ProductModule } from './product.module';

@Module({
	imports: [forwardRef(() => CategoryModule), forwardRef(() => CatalogModule), forwardRef(() => ProductModule)],
	providers: [ImportService],
	controllers: [ImportController]
})
export class ImportModule {}
