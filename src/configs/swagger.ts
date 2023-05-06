import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

import { extraModels } from 'src/swagger/extraModels';
import { includes } from 'src/swagger/includes';
import { swaggerConfig } from './configs';

export const ApplySwagger = (app) => {
	const SwaggerConfig = new DocumentBuilder()
		.setTitle(swaggerConfig.title)
		.setDescription(swaggerConfig.description)
		.setContact(swaggerConfig.contactName, swaggerConfig.contactUrl, swaggerConfig.contactEmail)
		.setVersion(swaggerConfig.version)
		.setLicense(swaggerConfig.licenseName, swaggerConfig.licenseUrl)
		.addTag(swaggerConfig.tag)
		.addBearerAuth()
		.build();

	const swaggerOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
		ignoreGlobalPrefix: false,
		include: includes,
		extraModels
	};

	const document = SwaggerModule.createDocument(app, SwaggerConfig, swaggerOptions);

	SwaggerModule.setup('api/v1/docs', app, document, {
		explorer: true,
		customCssUrl: '../../swagger-ui/swagger-material.css',
		customSiteTitle: 'OMS API Document',
		customfavIcon: '../../images/favicon.png'
	});
};
