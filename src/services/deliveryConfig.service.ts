import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateDelieveryConfigDto } from 'src/dtos/requests/deliveryConfig/creatDeliveryConfig.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { DeliveryConfig } from 'src/models/deliveryConfig.model';

@Injectable()
export class DeliveryConfigService {
	constructor(
		@InjectModel(DeliveryConfig)
		private readonly DeliveryConfigModel: typeof DeliveryConfig
	) {}

	async createDeliveryConfig(data: CreateDelieveryConfigDto, user: IUserAuth): Promise<void> {}
}
