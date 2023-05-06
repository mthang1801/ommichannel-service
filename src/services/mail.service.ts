import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import messages from 'src/common/constants/messages';
import { AMQPExchange, AMQPRoutingKey } from 'src/configs/amqp';
import { AMQPQueue } from '../configs/amqp';
import { IUserActivateEmail } from '../interfaces/userSignUpEmail.interface';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendMailExample(): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.mailerService.sendMail({
					to: 'maivthang95@gmail.com',
					subject: 'test Email',
					template: 'example',
					context: {
						name: 'Mai Van Thang',
						header: 'Header',
						body: 'Body',
						footer: 'Footer'
					}
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	async sendUserActivateSignUpAccount(userEmailData: IUserActivateEmail): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.mailerService.sendMail({
					to: userEmailData.email,
					subject: messages.email.activateAccount.subject,
					template: 'activateSignupAccount',
					context: {
						greeting: messages.email.activateAccount.context.greeting(userEmailData.fullname),
						body: messages.email.activateAccount.context.body(userEmailData.url),
						footer: messages.email.activateAccount.context.footer
					}
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	async sendUserReActivateSignUpAccount(userEmailData: IUserActivateEmail): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				console.log("sendUserReActivateSignUpAccount", userEmailData)
				await this.mailerService.sendMail({
					to: userEmailData.email,
					subject: messages.email.reactivateAccount.subject,

					template: 'activateSignupAccount',
					context: {
						greeting: messages.email.reactivateAccount.context.greeting(userEmailData.fullname),
						body: messages.email.reactivateAccount.context.body(userEmailData.url),
						footer: messages.email.reactivateAccount.context.footer
					}
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}
	async sendUserRecoveryAccount(userEmailData: IUserActivateEmail): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				console.log("sendUserRecoveryAccount", userEmailData)
				await this.mailerService.sendMail({
					to: userEmailData.email,
					subject: messages.email.recoveryAccount.subject,
					template: 'activateSignupAccount',
					context: {
						greeting: messages.email.recoveryAccount.context.greeting(userEmailData.fullname),
						body: messages.email.recoveryAccount.context.body(userEmailData.url),
						footer: messages.email.recoveryAccount.context.footer
					}
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	@RabbitSubscribe({
		exchange: AMQPExchange.SendEmail,
		routingKey: AMQPRoutingKey.SendEmailSignUp,
		queue: AMQPQueue.SendEmailSignUp,
		queueOptions: {			
			durable: true,
			autoDelete: true
		}
	})
	async sendEmailSignUp(userEmailData: IUserActivateEmail) {
		try {
			await this.sendUserActivateSignUpAccount(userEmailData);
			return new Nack();
		} catch (error) {
			if (Number(error.status) <= 500 && Number(error.status) >= 400) {
				return new Nack(true);
			}
		}
	}

	@RabbitSubscribe({
		routingKey: AMQPRoutingKey.SendEmailReactivate,
		exchange: AMQPExchange.SendEmail,
		queue: AMQPQueue.SendEmailReactivate,
		queueOptions: {			
			durable: true
		}
	})
	async sendEmailReactivate(userEmailData: IUserActivateEmail) {
		try {
			await this.sendUserReActivateSignUpAccount(userEmailData);
			return new Nack();
		} catch (error) {
			if (Number(error.status) <= 500 && Number(error.status) >= 400) {
				return new Nack(true);
			}
		}
	}

	@RabbitSubscribe({
		routingKey: AMQPRoutingKey.SendEmailRecoveryAccount,
		exchange: AMQPExchange.SendEmail,
		queue: AMQPQueue.SendEmailRecoveryAccount,
		queueOptions: {			
			durable: true
		}
	})
	async sendEmailRecoveryAccount(userEmailData: IUserActivateEmail) {
		try {
			await this.sendUserRecoveryAccount(userEmailData);
			return new Nack();
		} catch (error) {
			if (Number(error.status) <= 500 && Number(error.status) >= 400) {
				return new Nack(true);
			}
		}
	}
}
