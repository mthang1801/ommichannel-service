import { forwardRef, Module } from '@nestjs/common';
import { MessageGateway } from 'src/gateways/message.gateway';
import { UserModule } from './user.module';

@Module({
	imports: [forwardRef(() => UserModule)],
	providers: [MessageGateway]
})
export class GatewayModule {}
