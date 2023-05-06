import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CouponService } from 'src/services/coupon.service';
import { CouponController } from 'src/controllers/api/coupon.controller';
import { Coupon } from 'src/models/coupon.model';
import { CouponApplication } from 'src/models/couponApplication.model';
import { CouponDetail } from 'src/models/couponDetails.model';
import { Product } from 'src/models/product.model';
import { Category } from 'src/models/category.model';
import { ProductCategory } from 'src/models/productCategory.model';

const internalSequelizeFeatures = SequelizeModule.forFeature([
	Coupon,
	CouponApplication,
	CouponDetail,
	Product,
	Category,
	ProductCategory
]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [CouponController],
	providers: [
		CouponService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, CouponService]
})
export class CouponModule {}
