import {
	CallHandler,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { dbConfig } from '../../configs/configs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
	constructor(
		@Inject('SEQUELIZE')
		private readonly sequelizeInstance: Sequelize
	) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const httpContext = context.switchToHttp();
		const req = httpContext.getRequest();
		const transaction: Transaction = await this.sequelizeInstance.transaction({
			logging: dbConfig.logging // Just for debugging purposes
		});
		req.transaction = transaction;
		return next.handle().pipe(
			tap(async () => {
				await transaction.commit();
			}),
			catchError(async (err) => {
				await transaction.rollback();
				throw new HttpException(
					this.handleResponseError(err?.response?.message || err.message),
					err.status || HttpStatus.CONFLICT
				);
			})
		);
	}

	handleResponseError(message: string | string[]) {
		if (typeof message === 'string') return message;
		if (typeof message === 'object' && Array.isArray(message)) {
			let responseMessage = '';
			for (const [i, messageItem] of message.entries()) {
				if (i !== 0) {
					responseMessage += ', ';
				}
				responseMessage += messageItem;
			}
			return responseMessage;
		}
	}
}
