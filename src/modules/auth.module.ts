import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { jwtConfig } from 'src/configs/configs';
import { AuthController } from 'src/controllers/api/auth.controller';
import { User } from 'src/models/user.model';
import { UserToken } from 'src/models/userToken.model';
import { FunctModule } from 'src/modules/funct.module';
import { RoleModule } from 'src/modules/role.module';
import { SellerModule } from 'src/modules/seller.module';
import { UserModule } from 'src/modules/user.module';
import { AuthService } from 'src/services/auth.service';
import { CatalogModule } from './catalog.module';
import { CategoryModule } from './category.module';
import { SellerGeneralSettingModule } from './sellerGeneralSetting.module';
import { ServicePackageModule } from './servicePackage.module';
import { WarehouseModule } from './warehouse.module';
@Module({
	imports: [
		UserModule,
		SellerModule,
		RoleModule,
		PassportModule,
		FunctModule,
		JwtModule.register({
			secret: jwtConfig.secret,
			signOptions: { expiresIn: jwtConfig.expire }
		}),
		forwardRef(() => WarehouseModule),
		forwardRef(() => SellerGeneralSettingModule),
		forwardRef(() => CategoryModule),
		forwardRef(() => CatalogModule),
		forwardRef(() => ServicePackageModule),
	],
	controllers: [AuthController],
	providers: [AuthService, TransactionInterceptor, { provide: sequelizeProvider, useExisting: Sequelize }],
	exports: []
})
export class AuthModule {}
