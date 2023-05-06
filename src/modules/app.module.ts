import { Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core/constants';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from 'nestjs-redis';
import { join } from 'path';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { dbConfig } from 'src/configs/configs';
import { HomeController } from 'src/controllers/common/home.controller';
import { CachingModule } from 'src/microservices/caching/caching.module';
import { AttributeModule } from 'src/modules/attribute.module';
import { AuthModule } from 'src/modules/auth.module';
import { BankModule } from 'src/modules/bank.module';
import { CatalogModule } from 'src/modules/catalog.module';
import { CategoryModule } from 'src/modules/category.module';
import { CronFunctionModule } from 'src/modules/cronFunction.module';
import { CronJobModule } from 'src/modules/cronJob.module';
import { CustomerModule } from 'src/modules/customer.module';
import { DataTypeModule } from 'src/modules/dataType.module';
import { DeliveryTypeModule } from 'src/modules/deliveryType.module';
import { DistrictModule } from 'src/modules/district.module';
import { FunctModule } from 'src/modules/funct.module';
import { ImportGoodModule } from 'src/modules/importGood.module';
import { InventoryReceiptModule } from 'src/modules/inventoryReceipt.module';
import { MailModule } from 'src/modules/mail.module';
import { OrderModule } from 'src/modules/order.module';
import { OrderStatusModule } from 'src/modules/orderStatus.module';
import { PathUrlStorageModule } from 'src/modules/pathUrlStorage.module';
import { PaymentMethodModule } from 'src/modules/paymentMethod.module';
import { PlatformModule } from 'src/modules/platform.module';
import { ProductModule } from 'src/modules/product.module';
import { ProvinceModule } from 'src/modules/province.module';
import { RoleModule } from 'src/modules/role.module';
import { SchedulerModule } from 'src/modules/scheduler.module';
import { SellerPlatformModule } from 'src/modules/sellerPlatform.module';
import { ShippingUnitModule } from 'src/modules/shippingUnit.module';
import { SupplierModule } from 'src/modules/supplier.module';
import { UnitModule } from 'src/modules/unit.module';
import { UploadModule } from 'src/modules/upload.module';
import { UserModule } from 'src/modules/user.module';
import { VoucherModule } from 'src/modules/voucher.module';
import { WardModule } from 'src/modules/ward.module';
import { WarehouseModule } from 'src/modules/warehouse.module';
import { WarehouseStaffModule } from 'src/modules/warehouseStaff.module';
import { redisConfig } from '../configs/configs';
import { AMQPModule } from './amqp.module';
import { CodAndCarriageBillModule } from './codAndCarriageBill.module';
import { CouponModule } from './coupon.module';
import { CustomerPointConfigModule } from './customerPointConfig.module';
import { DeliveryConfigModule } from './deliveryConfig.module';
import { ExportModule } from './export.module';
import { HealthModule } from './health.module';
import { ImportModule } from './import.module';
import { PromotionModule } from './promotion.module';
import { SellerGeneralSettingModule } from './sellerGeneralSetting.module';
import { ServicePackageModule } from './servicePackage.module';
import { TransportOverviewModule } from './transportOverview.module';

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: 'mysql',
			logging: false,
			models: [join(__dirname, 'models/*.model.ts')],
			autoLoadModels: true,
			synchronize: true,
			timezone: '+07:00',
			pool: {
				max: 20,
				min: 2,
				acquire: 30000,
				idle: 10000
			},
			replication: {
				write: {
					host: dbConfig.master.host,
					username: dbConfig.master.username,
					database: dbConfig.master.database,
					password: dbConfig.master.password,
					port: dbConfig.master.port
				},
				read: [
					{
						host: dbConfig.slave.host,
						username: dbConfig.slave.username,
						database: dbConfig.slave.database,
						password: dbConfig.slave.password,
						port: dbConfig.slave.port
					}
				]
			}
		}),
		ScheduleModule.forRoot(),
		RedisModule.register({
			host: redisConfig.host,
			port: redisConfig.port,
			password: redisConfig.password,
			onClientReady: (client) => {
				client.on('error', (err) => {
					Logger.error('Connect redis error', err);
				});

				client.once('ready', () => {
					Logger.log('Redis is ready');
				});
			}
		}),
		CachingModule,
		HealthModule,
		CronJobModule,
		MailModule,
		UploadModule,
		AuthModule,
		UserModule,
		RoleModule,
		FunctModule,
		ProductModule,
		AttributeModule,
		ProvinceModule,
		DistrictModule,
		WardModule,
		SupplierModule,
		WarehouseModule,
		PlatformModule,
		WarehouseStaffModule,
		SellerPlatformModule,
		BankModule,
		PaymentMethodModule,
		SchedulerModule,
		DataTypeModule,
		CronFunctionModule,
		CategoryModule,
		PathUrlStorageModule,
		UnitModule,
		ImportGoodModule,
		DeliveryTypeModule,
		OrderStatusModule,
		OrderModule,
		ShippingUnitModule,
		VoucherModule,
		InventoryReceiptModule,
		CatalogModule,
		CustomerModule,
		SellerGeneralSettingModule,
		DeliveryConfigModule,
		CodAndCarriageBillModule,
		ServicePackageModule,
		TransportOverviewModule,
		PromotionModule,
		CustomerPointConfigModule,
		CouponModule,
		AMQPModule,
		ExportModule,
		ImportModule
	],
	controllers: [HomeController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter
		},
		{
			provide: APP_GUARD,
			useClass: AuthGuard
		}
	]
})
export class AppModule {}
