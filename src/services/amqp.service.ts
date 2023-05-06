import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AMQPService {
	constructor(public readonly amqpConnection: AmqpConnection) {}
}
