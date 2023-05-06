import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { BankQueryParamsDto } from 'src/dtos/requests/bank/bankQueryParams.dto';
import { PaymentMethod } from 'src/models/paymentMethod.model';

@Injectable()
export class PaymentMethodService {
	constructor(
		@InjectModel(PaymentMethod)
		private readonly PaymentMethodModel: typeof PaymentMethod
	) {}

	async getPaymentMethodList(queryParams: BankQueryParamsDto): Promise<ResponseAbstractList<PaymentMethod>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					payment_method: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(await this.PaymentMethodModel.findAll({ where: _whereClause }));

		return rows;
	}
}
