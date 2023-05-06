import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { ShippingUnitController } from 'src/controllers/api/shippingUnit.controller';
import { SellerShippingPaymentMethod } from 'src/models/sellerShippingPaymentMethod.model';
import { SellerShippingService } from 'src/models/sellerShippingService.model';
import { SellerShippingUnit } from 'src/models/sellerShippingUnit.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { ShippingUnitService } from 'src/services/shippingUnit.service';
import { DistrictModule } from './district.module';
import { ProvinceModule } from './province.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	ShippingUnit,
	SellerShippingUnit,
	SellerShippingService,
	SellerShippingPaymentMethod
]);

export const shippingUnitFeaturesRepo = internalSequelizeFeatures;

@Module({
	imports: [internalSequelizeFeatures, ProvinceModule, DistrictModule],
	controllers: [ShippingUnitController],
	providers: [
		ShippingUnitService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures]
})
export class ShippingUnitModule {}
