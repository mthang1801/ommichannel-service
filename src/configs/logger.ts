import { INestApplication } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import * as morgan from 'morgan';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { appConfig } from './configs';

export const WinstonLogger = WinstonModule.createLogger({
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'DD/MM/YYYY HH:mm:ss'
				}),
				winston.format.uncolorize(),
				winston.format.printf(
					(info) =>
						`${info.timestamp} ${info.level}: ${info.message}` +
						(info.splat !== undefined ? `${info.splat}` : ' ')
				),
				winston.format.json(),
				nestWinstonModuleUtilities.format.nestLike('OMS-SVC', {
					colors: true,
					prettyPrint: true
				})
			)
		}),
		new winston.transports.File({
			filename: 'logs/_error.log',
			level: 'error',
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'DD/MM/YYYY HH:mm:ss'
				}),
				winston.format.json()
			)
		}),
		new winston.transports.File({
			filename: 'logs/_warn.log',
			level: 'warn',
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'DD/MM/YYYY HH:mm:ss'
				}),
				winston.format.json()
			)
		}),
		new winston.transports.File({
			filename: 'logs/_combined.log',
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'DD/MM/YYYY HH:mm:ss'
				}),
				winston.format.json()
			)
		})
	]
});

export const MorganLogger = (app: INestApplication): void => {
	if (appConfig.env === 'development') {
		app.use(
			morgan(function (tokens, req: Request, res: Response) {
				return [
					[
						tokens.method(req, res),
						tokens.url(req, res),
						'-',
						tokens.status(req, res),
						tokens.res(req, res, 'content-length'),
						'-',
						tokens['response-time'](req, res),
						'ms'
					].join(' '),
					Object.entries(req.body).length ? `data: ${JSON.stringify(req.body)}` : undefined,
					'\n'
				]
					.filter(Boolean)
					.join('\n');
			})
		);
	}
};
