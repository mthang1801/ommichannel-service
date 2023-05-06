import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateDelieveryConfigDto } from 'src/dtos/requests/deliveryConfig/creatDeliveryConfig.dto';
import { DeliveryConfigService } from 'src/services/deliveryConfig.service';

@Controller('delivery-configs')
@ApiTags('Cấu hình vận chuyển')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		required: true,
		description: 'Access Token',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
	},
	{
		name: 'x-auth-uuid',
		required: true,
		example: 'hdwqiouhqwoiehuiowq921467910djqwodjqwdnwqo'
	}
])
export class DeliveryConfigController {
	constructor(private readonly deliveryConfigService: DeliveryConfigService) {}
	@Post()
	@ApiBody({ type: CreateDelieveryConfigDto })
	@ApiOperation({ summary: 'Tạo cấu hình vận chuyển' })
	async createDeliveryConfig(@Body() data: CreateDelieveryConfigDto, @Req() req: Request): Promise<void> {
		await this.deliveryConfigService.createDeliveryConfig(data, req['user']);
	}
}
