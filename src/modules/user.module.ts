import { forwardRef, Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { UserProfileController } from 'src/controllers/api/userProfile.controller';
import { UserSystemController } from 'src/controllers/api/userSystem.controller';
import { Role } from 'src/models/role.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/userRole.model';
import { UserToken } from 'src/models/userToken.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { UserService } from 'src/services/user.service';
import { ServicePackageModule } from './servicePackage.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([User, UserRole, UserToken, Role, WarehouseStaff]);
@Global()
@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => ServicePackageModule)],
	controllers: [UserSystemController, UserProfileController],
	providers: [
		UserService,
		TransactionInterceptor,
		{
			provide: sequelizeProvider,
			useExisting: Sequelize
		}
	],
	exports: [internalSequelizeFeatures, UserService]
})
export class UserModule {}
