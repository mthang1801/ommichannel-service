import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
	constructor() {}

	async canActivate(context: ExecutionContext): Promise<boolean | any | Promise<boolean | any>> {
		console.log(context)

		
		return context
		// const client: Socket = context.switchToWs().getClient<Socket>();
		// console.log(client);
		// const authToken: any = client.handshake?.query?.token;
		// try {
		// 	//   const decoded = this.jwtService.verify(authToken);
		// 	//   const user = await this.userService.getUserByEmail(decoded.email); // response to function
		// 	//   context.switchToWs().getData().user = user;
		// 	//   return user;
		// } catch (ex) {
		// 	return false;
		// }
	}
}
