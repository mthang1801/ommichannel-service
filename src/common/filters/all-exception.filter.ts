import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { typeOf } from 'src/utils/functions.utils';
import { ExceptionCodeEnum } from '../constants/enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private logger = new Logger(AllExceptionsFilter.name);

	async catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();

		const res: Response = ctx.getResponse();
		const req: Request = ctx.getRequest();
		const contextType = host.getType<'http' | 'rmq'>();

		const statusCode = this.getStatusCode(exception);

		const message = this.getMessage(exception);

		this.writeLogger(message, req, exception);

		if (contextType === 'rmq') {
			return {
				success: false,
				statusCode,
				data: null,
				message
			};
		}

		res.status(statusCode).json({
			success: false,
			statusCode,
			data: null,
			message
		});
	}

	getStatusCode(exception: HttpException): number {
		let statusCode =
			exception instanceof HttpException ? exception.getStatus() || 500 : HttpStatus.INTERNAL_SERVER_ERROR;
		const exceptionName = exception.name;

		if (ExceptionCodeEnum.hasOwnProperty(exceptionName)) {
			statusCode = ExceptionCodeEnum[exceptionName];
		}

		return statusCode;
	}

	getMessage(exception: HttpException): string {
		let messageResponse: any;
		if ((exception as any) instanceof HttpException) {
			messageResponse = exception.getResponse() || exception.message;
		} else if (exception instanceof Error) {
			messageResponse =
				exception['errors'] && typeOf(exception['errors']) === 'array' ? exception['errors'][0] : exception;
		} else {			
			messageResponse = exception['message'] || 'Internal server';
		}

		let messageResult = '';
		if (messageResponse instanceof Object) {
			if (typeOf(messageResponse) === 'array') {
				messageResult = messageResponse.filter(Boolean).join(', ');
			} else if (typeOf(messageResponse) === 'object') {
				messageResult = Object.values(messageResponse).filter(Boolean).join(', ');
			}
		} else {
			messageResult = messageResponse;
		}

		return messageResult || 'Internal server';
	}

	writeLogger(message: string, req: Request, exception: HttpException) {
		const stack = [
			{ stack: exception.stack },
			{ url: req.url },
			{ method: req.method },
			{ body: req.body },
			{ params: req['params'] },
			{ query: req['query'] }
		];

		this.logger.error(message, stack, exception.name);
	}
}
