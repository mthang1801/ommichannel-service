import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { OrderStatus } from 'src/models/orderStatus.model';
import { OrderStatusService } from 'src/services/orderStatus.service';

@Controller('order-statuses')
export class OrderStatusController {
	constructor(private readonly orderStatusService: OrderStatusService) {}

	@SkipAuth()
	@Get()
	async getOrderStatusList(@Query() queryParams): Promise<ResponseAbstractList<OrderStatus>> {
		return this.orderStatusService.getOrderStatusList(queryParams);
	}
}
