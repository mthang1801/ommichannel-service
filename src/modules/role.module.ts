import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleController } from 'src/controllers/api/role.controller';
import { Funct } from 'src/models/funct.model';
import { Role } from 'src/models/role.model';

import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { RoleFunct } from 'src/models/roleFunc.model';
import { UserRole } from 'src/models/userRole.model';
import { RoleService } from 'src/services/role.service';
import { Sequelize } from 'sequelize-typescript';
import { sequelizeProvider } from 'src/common/constants/constant';

const internalSequelizeFeatures = SequelizeModule.forFeature([Role, RoleFunct, Funct, UserRole]);

@Module({
	imports: [internalSequelizeFeatures],
	controllers: [RoleController],
	providers: [RoleService, TransactionInterceptor, { provide: sequelizeProvider, useExisting: Sequelize }],
	exports: [RoleService, internalSequelizeFeatures]
})
export class RoleModule {}
