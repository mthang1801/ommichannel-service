import configService  from './configService';

export const dbConfig = configService.DatabaseConfig();
export const jwtConfig = configService.JwtConfig();
export const redisConfig = configService.RedisConfig();
export const mailConfig = configService.MailTransportConfig();
export const validConfig = configService.ValidationConfig();
export const appConfig = configService.AppConfig();
export const swaggerConfig = configService.SwaggerConfig();
export const amqpConfig = configService.RabbitMQ();
export const platformConfig = configService.PlatformConfig();
export const uploadConfig = configService.UploadConfig();
export const elsConfig = configService.ElasticSearchConfig();
export const urlConfig = configService.URLConfig();
export const userAuthConfig = configService.UserAuthentication();
export const shippingUnitConfig = configService.ConnectShippingUnit();
