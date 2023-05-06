import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { appDir } from 'src/common/constants/constant';
import * as hbs from 'hbs';

export const viewEngineConfig = (app: NestExpressApplication) => {
	app.useStaticAssets(join(appDir, '..', 'public'));
	app.setBaseViewsDir(join(appDir, '..', 'views'));
	app.setViewEngine('hbs');
	hbs.registerPartials(join(appDir, '..', '/views/partials'));
};
