import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import 'dotenv/config';

import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { appConfig, validConfig } from './configs';
import { MorganLogger } from './logger';
import { viewEngineConfig } from './viewEngine.config';

export const ApplyGlobal = (app: NestExpressApplication) => {
	// Middleware Logger Morgan
	MorganLogger(app);

	app.useGlobalPipes(new ValidationPipe(validConfig));

	app.useGlobalInterceptors(new TransformInterceptor());

	app.use(require('helmet')());

	function shouldCompress(req, res) {
		if (req.headers['x-no-compression']) {
			// don't compress responses with this request header
			return false;
		}
		// fallback to standard filter function
		return compression.filter(req, res);
	}

	app.use(compression({ filter: shouldCompress }));

	viewEngineConfig(app);

	app.setGlobalPrefix(appConfig.apiPrefix, {
		exclude: appConfig.exludeGlobalPrefix
	});

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: appConfig.enableVersioning
	});

	app.enableShutdownHooks();

	app.enableCors({ origin: 'http://localhost:3000' });
};
