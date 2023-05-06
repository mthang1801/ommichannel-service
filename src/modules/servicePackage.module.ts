import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServicePackageController } from 'src/controllers/api/servicePackage.controller';
import { BenefitPackage } from 'src/models/benefitPackage';
import { SellerServicePackage } from 'src/models/sellerServicePackages.model';
import { ServiceBenefitPackage } from 'src/models/serviceBenefitPackage.model';
import { ServicePackage } from 'src/models/servicePackage.model';
import { ServicePackageService } from 'src/services/servicePackage.service';
const internalSequelizeFeatures = SequelizeModule.forFeature([
	ServicePackage,
	BenefitPackage,
	ServiceBenefitPackage,
	SellerServicePackage
]);
@Module({
	imports: [internalSequelizeFeatures],
	controllers: [ServicePackageController],
	providers: [ServicePackageService],
	exports: [ServicePackageService]
})
export class ServicePackageModule {}
