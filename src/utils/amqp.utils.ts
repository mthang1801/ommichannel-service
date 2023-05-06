import { isObject, isString } from '@nestjs/common/utils/shared.utils';
import amqplib from 'amqplib';
import { typeOf } from './functions.utils';

export function RPCReplyErrorCallback(channel: amqplib.Channel, msg: amqplib.ConsumeMessage, error: any) {
	const { replyTo, correlationId } = msg.properties;
	if (replyTo) {
		if (error instanceof Error) {
			error = error.message;
		} else if (typeOf(error) !== 'string') {
			error = JSON.stringify(error);
		}

		error = Buffer.from(JSON.stringify({ status: 'error', message: error }));
		channel.publish('', replyTo, error, { correlationId });

		channel.ack(msg);
	}
}

export class RpcException extends Error {
	constructor(private readonly error: string | object) {
		super();
		this.initMessage();
	}

	initMessage() {
		if (isString(this.error)) {
			this.message = this.error;
		} else if (isObject(this.error) && isString((this.error as Record<string, any>).message)) {
			this.message = (this.error as Record<string, any>).message;
		} else if (this.constructor) {
			this.message = this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g).join(' ');
		}
	}

	public getError(): string | object {
		return this.error;
	}
}
