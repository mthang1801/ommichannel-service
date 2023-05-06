import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { OrderStatus } from 'src/models/orderStatus.model';
import { OrderStatusQueryParamsDto } from 'src/dtos/requests/order/orderStatusQueryParams.dto';

@Injectable()
export class OrderStatusService {
	constructor(
		@InjectModel(OrderStatus)
		private readonly OrderStatusModel: typeof OrderStatus
	) {}

	async getOrderStatusList(queryParams: OrderStatusQueryParamsDto): Promise<ResponseAbstractList<OrderStatus>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					order_status: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(await this.OrderStatusModel.findAll({ where: _whereClause }));

		return rows;
	}
}
