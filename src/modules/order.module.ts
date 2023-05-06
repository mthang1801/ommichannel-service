import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { OrderController } from 'src/controllers/api/order.controller';
import { Order } from 'src/models/order.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { OrderDeliveryLog } from 'src/models/orderDeliveryLog.model';
import { OrderDetail } from 'src/models/orderDetail.model';
import { OrderPaymentDetail } from 'src/models/orderPaymentDetail.model';
import { OrderPaymentLog } from 'src/models/orderPaymentLog.model';
import { OrderStatusLog } from 'src/models/orderStatusLog.model';
import { PaymentMethod } from 'src/models/paymentMethod.model';
import { Platform } from 'src/models/platform.model';
import { Seller } from 'src/models/seller.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { Warehouse } from 'src/models/warehouse.model';
import { OrderService } from 'src/services/order.service';
import { ShippingUnitService } from 'src/services/shippingUnit.service';
import { CodAndCarriageBill } from '../models/codAndCarriageBill.model';
import { CustomerModule } from './customer.module';
import { ProductModule } from './product.module';
import { ShippingUnitModule } from './shippingUnit.module';
import { CouponDetail } from 'src/models/couponDetails.model';
import { Category } from 'src/models/category.model';
import { Catalog } from 'src/models/catalog.model';
import { CategoryService } from 'src/services/category.service';
import { CatalogService } from 'src/services/catalog.service';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { SellerCatalog } from 'src/models/sellerCatalog.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	Order,
	Seller,
	Platform,
	Warehouse,
	ShippingUnit,
	PaymentMethod,
	OrderDetail,
	OrderPaymentDetail,
	OrderStatusLog,
	OrderDeliveryLog,
	OrderPaymentLog,
	CodAndCarriageBill,
	OrderDelivery,
	CouponDetail,
	Category,
	Catalog,
	CategoryAttribute,
	CatalogCategory,
	SellerCatalog
]);

@Module({
	imports: [
		internalSequelizeFeatures,
		forwardRef(() => ShippingUnitModule),
		forwardRef(() => ProductModule),
		forwardRef(() => CustomerModule)
	],
	controllers: [OrderController],
	providers: [
		OrderService,
		CategoryService,
		CatalogService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		},
		ShippingUnitService
	],
	exports: [internalSequelizeFeatures, OrderService]
})
export class OrderModule {}
