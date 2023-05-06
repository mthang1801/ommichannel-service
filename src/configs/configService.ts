import { HttpStatus, RequestMethod } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import 'dotenv/config';
import * as fs from 'fs';
import { RedisModuleOptions } from 'nestjs-redis';
import { join } from 'path';
import { cwd } from 'process';
import {
	DatabaseConfig,
	IAppConfig,
	IElasticsearchConfig,
	IJWTConfig,
	IMailTransportConfig,
	IRabbitMQConfig,
	IUploadConfig
} from 'src/interfaces/config.interface';

const getAllKeysFromEnvFile: string[] = fs
	.readFileSync(join(cwd(), '.env'), 'utf8')
	.split('\n')
	.filter((row: string) => !row.startsWith('#'))
	.filter((row: string) => !row.startsWith('\r'))
	.filter(Boolean)
	.map((row: string) => row.split('=').slice(0)[0]);

export const envKeys: string[] = getAllKeysFromEnvFile;

class ConfigService {
	constructor(private readonly env: { [key: string]: string | undefined }) {}

	getValue(key: string, throwOnMissing = false) {
		const value = this.env[key];
		if (value === undefined && throwOnMissing) {
			throw new Error(`read config error - missing env.${key}`);
		}
		return value;
	}

	getValues(keys: string[]) {
		keys.forEach((key) => this.getValue(key, true));
		return this;
	}

	private getFile(key: string) {
		const fullPath = this.getValue(key);
		if (!fs.existsSync(fullPath)) {
			throw new Error(`read config error - key: ${key}, value: ${fullPath} is not existed`);
		}
	}

	getFiles(keys: string[]) {
		keys.forEach((key) => this.getFile(key));
		return this;
	}

	DatabaseConfig(): DatabaseConfig {
		const master = {
			host: this.getValue('MYSQL_MASTER_HOST'),
			port: Number(this.getValue('MYSQL_MASTER_PORT')),
			username: this.getValue('MYSQL_MASTER_USERNAME'),
			password: this.getValue('MYSQL_MASTER_PASSWORD'),
			database: this.getValue('MYSQL_MASTER_DATABASE')
		};

		const slave = {
			host: this.getValue('MYSQL_SLAVE_HOST'),
			port: Number(this.getValue('MYSQL_SLAVE_PORT')),
			username: this.getValue('MYSQL_SLAVE_USERNAME'),
			password: this.getValue('MYSQL_SLAVE_PASSWORD'),
			database: this.getValue('MYSQL_SLAVE_DATABASE')
		};

		return {
			master,
			slave,
			logging: this.getValue('NODE_ENV') === 'development'
		};
	}

	JwtConfig(): IJWTConfig {
		return {
			secret: this.getValue('JWT_SECRET_KEY'),
			expire: Number(this.getValue('JWT_EXPIRES_IN'))
		};
	}

	RedisConfig(): RedisModuleOptions {
		return {
			host: this.getValue('REDIS_HOST'),
			port: Number(this.getValue('REDIS_PORT')),
			password: this.getValue('REDIS_PASS'),
			db: 5,
			keyPrefix: '[OMS]'
		};
	}

	MailTransportConfig(): IMailTransportConfig {
		const mailTransportConfig: IMailTransportConfig = {
			host: this.getValue('EMAIL_HOST'),
			secure: true,
			port: Number(this.getValue('EMAIL_PORT')),
			auth: {
				user: this.getValue('EMAIL_USER'),
				pass: this.getValue('EMAIL_PASS')
			},
			tls: { rejectUnauthorized: false },
			debug: true
		};

		return mailTransportConfig;
	}

	ValidationConfig(): ValidatorOptions | Record<string, any> {
		return {
			transform: true,
			whitelist: true,
			errorHttpStatusCode: HttpStatus.BAD_REQUEST,
			forbidNonWhitelisted: false,
			disableErrorMessages: false,
			skipMissingProperties: false
		};
	}

	AppConfig(): IAppConfig {
		return {
			port: Number(this.getValue('PORT')),
			wsPort: Number(this.getValue('WS_PORT')),
			bcryptSalt: Number(this.getValue('BCRYPT_SALT')),
			apiPrefix: this.getValue('GLOBAL_PREFIX') || 'api',
			exludeGlobalPrefix: [
				{ path: 'uploads', method: RequestMethod.ALL },
				{ path: '/', method: RequestMethod.GET },
				{ path: '/health', method: RequestMethod.GET }
			],
			whiteListCORS: this.getValue('WHITE_LIST_CORS').split(','),
			enableVersioning: ['1'],
			healthCheckAPIDomain: this.getValue('HEALTH_CHECK_API_DOMAIN'),
			env: this.getValue('NODE_ENV')
		};
	}

	SwaggerConfig() {
		return {
			title: 'OMS Service Builder',
			description: 'OMS Service Description',
			contactName: 'NestJS Example API',
			contactUrl: 'https://mvt-blog.com/',
			contactEmail: 'mthang1801@gmail.com',
			version: '1.0',
			tag: 'Nội dung',
			licenseName: '',
			licenseUrl: 'localhost',
			serverURl: this.getValue('API_URL')
		};
	}

	RabbitMQ(): IRabbitMQConfig {
		return {
			rabbitUri: this.getValue('RABBIT_URI')
		};
	}

	PlatformConfig() {
		return {
			SHOPEE: {
				host: 'https://partner.shopeemobile.com',
				token: {
					refresh_token: '574a6a4e556b4459534f456e5a634d45',
					access_token: '64674868704d7a71514959646e4e5a69',
					expire_in: 14338.0,
					token_createdDate: 1649393496,
					partner_id: 2003584,
					partner_key: '68c43e5943521b0a869feab0fe8ad2c7d3ac550681b2937fab652c0e60d9ddd8',
					shop_id: 175352313,
					Merchant_id: 0,
					authorized_code: '4245765675416d666c6e737642715368',
					request_id: '3488d570eff202e7f49b082106ac9fc2',
					message: '',
					error: '',
					warning: null
				},
				orders: {
					getList: {
						apiPath: '/api/v2/order/get_order_list',
						method: 'GET'
					}
				}
			},
			TIKI: {},
			LAZADA: {},
			HARAVAN: {}
		};
	}

	UploadConfig(): IUploadConfig {
		return {
			cdnUrl: this.getValue('CDN_URL'),
			cdnSecurityUploadUrl: this.getValue('CDN_UPLOAD_AUTH_UUID'),
			uploadAPI: this.getValue('CDN_UPLOAD_URL')
		};
	}

	ElasticSearchConfig(): IElasticsearchConfig {
		return {
			searchNode: this.getValue('ELASTICSEARCH_NODE'),
			searchUser: this.getValue('ELASTICSEARCH_USERNAME'),
			searchPass: this.getValue('ELASTICSEARCH_PASSWORD')
		};
	}

	URLConfig() {
		return {
			website: this.getValue('WEBSITE_URL'),
			api: this.getValue('API_URL')
		};
	}

	UserAuthentication() {
		//Do not set position over 5
		return {
			SELLER_ADMIN_UUID: this.getValue('SELLER_ADMIN_UUID'),
			NT_ADMIN_UUID: this.getValue('NT_ADMIN_UUID'),
			AUTH_USER_ID_POSITION: 1,
			AUTH_USER_ROLE_CODE_POSITION: 2,
			AUTH_USER_ROLE_ID_POSITION: 3,
			AUTH_USER_SELLER_ID_POSITION: 4
		};
	}

	ConnectShippingUnit() {
		return {
			NTL: {
				partner_id: Number(this.getValue('NTL_PARTNER_ID')),
				api: this.getValue('NTL_API'),
				utm_source: this.getValue('NTL_UTM_SOURCE'),
				username: this.getValue('NTL_MASTER_USERNAME'),
				password: this.getValue('NTL_MASTER_PASSWD'),
				token: this.getValue('NTL_HOOK_TOKEN')
			}
		};
	}
}

export default new ConfigService(process.env).getValues(envKeys);
