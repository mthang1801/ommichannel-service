import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { AMQPExchange } from 'src/configs/amqp';
import { amqpConfig, mailConfig } from 'src/configs/configs';
import { MailService } from 'src/services/mail.service';

@Global()
@Module({
	imports: [
		MailerModule.forRoot({
			transport: mailConfig,
			defaults: {
				from: mailConfig.auth.user
			},
			template: {
				dir: join(__dirname, '..', '..', 'templates', 'mails'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: false
				}
			}
		}),		
		
	],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
