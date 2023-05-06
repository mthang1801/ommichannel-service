import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { DeliveryType } from 'src/models/deliveryType.model';
import { DeliveryTypeService } from 'src/services/deliveryType.service';

@Controller('delivery-types')
export class DeliveryTypeController {
	constructor(private readonly deliveryTypeService: DeliveryTypeService) {}

	@SkipAuth()
	@Get()
	async getDeliveryTypeList(@Query() queryParams): Promise<ResponseAbstractList<DeliveryType>> {
		return this.deliveryTypeService.getDeliveryTypeList(queryParams);
	}
}
