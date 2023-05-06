import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { DeliveryType } from 'src/models/deliveryType.model';
import { DeliveryTypeQueryParamsDto } from 'src/dtos/requests/deliveryType/deliveryTypeQueryParams.dto';

@Injectable()
export class DeliveryTypeService {
	constructor(
		@InjectModel(DeliveryType)
		private readonly DeliveryTypeModel: typeof DeliveryType
	) {}

	async getDeliveryTypeList(queryParams: DeliveryTypeQueryParamsDto): Promise<ResponseAbstractList<DeliveryType>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					delivery_type: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(await this.DeliveryTypeModel.findAll({ where: _whereClause }));

		return rows;
	}
}
