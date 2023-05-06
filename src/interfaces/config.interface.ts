import { RequestMethod } from '@nestjs/common';
export interface IJWTConfig {
	secret: string;
	expire: number;
}

export interface IMailTransportConfig {
	host: string;
	port: number;
	auth: {
		user: string;
		pass: string;
	};
	secure: boolean;
	tls: {
		rejectUnauthorized: boolean;
	};
	debug?: boolean;
}

export interface IUploadConfig {
	cdnUrl: string;
	cdnSecurityUploadUrl: string;
	uploadAPI: string;
}

export interface IRabbitMQConfig {
	rabbitUri: string;
}

export interface IElasticsearchConfig {
	searchNode: string;
	searchUser: string;
	searchPass: string;
}
export interface IDatabaseCconfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}
export interface DatabaseConfig {
	master: IDatabaseCconfig;
	slave: IDatabaseCconfig;
	logging?: boolean;
}

export interface URLConfig {
	website: string;
	api: string;
}

export interface IAppConfig {
	port: number;
	wsPort: number;
	bcryptSalt: number;
	apiPrefix: string;
	exludeGlobalPrefix: { path: string; method: RequestMethod }[];
	whiteListCORS: string[];
	enableVersioning: string[];
	healthCheckAPIDomain: string;
	env: string;
}
