import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import { AMQPExchange } from 'src/configs/amqp';
import { amqpConfig } from 'src/configs/configs';
import { AMQPService } from 'src/services/amqp.service';
@Global()
@Module({
	imports: [
		RabbitMQModule.forRootAsync(RabbitMQModule, {
			useFactory: () => ({
				exchanges: [
					{
						name: AMQPExchange.SendEmail,
						type: 'topic',
						options: {
							durable: true
						}
					},
					{
						name: AMQPExchange.OrderDelivery,
						type: 'topic',
						options: {
							durable: true
						}
					}
				],
				prefetchCount: 5,
				uri: amqpConfig.rabbitUri,
				connectionInitOptions: { wait: true, reject: true, timeout: 30000 }
			})
		})
	],
	providers: [AMQPService],
	exports: [AMQPService]
})
export class AMQPModule {}
