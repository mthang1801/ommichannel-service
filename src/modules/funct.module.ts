import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { FunctController } from 'src/controllers/api/funct.controller';
import { FunctService } from 'src/services/funct.service';
import { RoleModule } from './role.module';
import { ServicePackageModule } from './servicePackage.module';

@Module({
	imports: [RoleModule, forwardRef(() => ServicePackageModule)],
	controllers: [FunctController],
	providers: [FunctService],
	exports: [FunctService]
})
export class FunctModule {}
