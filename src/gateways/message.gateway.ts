import { forwardRef, Inject, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets/interfaces';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/services/user.service';
import { appConfig } from '../configs/configs';

@WebSocketGateway(appConfig.wsPort, { cors: { origin: '*' } })
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private logger = new Logger(MessageGateway.name);
	constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService) {}

	afterInit(server: any) {
		this.logger.log(server, 'Init');
	}

	async handleConnection(client: Socket) {
		this.logger.log(`${client.id} has Connected`);
		const information = {
			user_id: 1,
			type: 'socket_id',
			status: false,
			value: client.id
		};
		console.log('handleConnection::', information);
	}

	async handleDisconnect(client: Socket) {
		// const user = await this.getDataUserFromToken(client);
		// await this.informationService.deleteByValue(user.id, client.id);

		// need handle remove socketId to information table
		this.logger.log(client.id, 'Disconnect');
	}

	@SubscribeMessage('messages')
	async messages(client: Socket, payload) {
		console.log(client, client.id);
		console.log(payload);
	}
}
