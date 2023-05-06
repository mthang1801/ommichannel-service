import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Attribute } from 'src/models/attribute.model';
import { AttributeValue } from 'src/models/attributeValue.model';

import { sequelizeProvider } from 'src/common/constants/constant';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { AttributeController } from 'src/controllers/api/attribute.controller';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { AttributeService } from 'src/services/attribute.service';
import { CategoryModule } from './category.module';

const internalSequelizeFeatures = SequelizeModule.forFeature([Attribute, AttributeValue, CategoryAttribute]);
@Module({
	imports: [internalSequelizeFeatures, forwardRef(() => CategoryModule)],
	controllers: [AttributeController],
	providers: [AttributeService, TransactionInterceptor, { provide: sequelizeProvider, useExisting: Sequelize }]
})
export class AttributeModule {}
