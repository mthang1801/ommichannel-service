import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { PaymentMethod } from 'src/models/paymentMethod.model';
import { PaymentMethodService } from 'src/services/paymentMethod.service';

@Controller('payment-methods')
export class PaymentMethodController {
	constructor(private readonly paymentMethodService: PaymentMethodService) {}

	@SkipAuth()
	@Get()
	async getPaymentMethodList(@Query() queryParams): Promise<ResponseAbstractList<PaymentMethod>> {
		return this.paymentMethodService.getPaymentMethodList(queryParams);
	}
}
