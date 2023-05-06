import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Seller } from 'src/models/seller.model';
import { SellerCatalog } from 'src/models/sellerCatalog.model';
import { SellerServicePackage } from 'src/models/sellerServicePackages.model';
import { SellerShippingUnit } from 'src/models/sellerShippingUnit.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { SellerService } from 'src/services/seller.service';

@Module({
	imports: [SequelizeModule.forFeature([Seller, ShippingUnit, SellerShippingUnit, SellerServicePackage, SellerCatalog])],
	providers: [SellerService],
	exports: [SellerService]
})
export class SellerModule {}
