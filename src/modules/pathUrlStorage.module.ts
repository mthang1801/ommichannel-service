import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PathUrlStorageController } from 'src/controllers/api/pathUrlStorage.controller';
import { PathUrl } from 'src/models/pathUrl.model';
import { PathUrlStorageService } from 'src/services/pathUrlStorage.service';

const internalSequelizeFeatures = SequelizeModule.forFeature([PathUrl]);

@Global()
@Module({
	imports: [internalSequelizeFeatures],
	controllers: [PathUrlStorageController],
	providers: [PathUrlStorageService],
	exports: [PathUrlStorageService, internalSequelizeFeatures]
})
export class PathUrlStorageModule {}
