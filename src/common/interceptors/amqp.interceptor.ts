import {isRabbitContext} from "@golevelup/nestjs-rabbitmq";
import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AMQPInterceptor implements NestInterceptor{
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		// Do nothing if this is a RabbitMQ event
		if(isRabbitContext(context)){
			return next.handle()
		}
		 // Execute custom interceptor logic for HTTP request/response
		return next.handle()
	}
}