import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { Bank } from 'src/models/bank.model';
import { BankQueryParamsDto } from 'src/dtos/requests/bank/bankQueryParams.dto';
import { BankBranch } from 'src/models/bankBranch.model';
import { BankBranchQueryParamsDto } from 'src/dtos/requests/bank/bankBranchQueryParams.dto';

@Injectable()
export class BankService {
	constructor(
		@InjectModel(Bank)
		private readonly BankModel: typeof Bank,
		@InjectModel(BankBranch)
		private readonly BankBranchModel: typeof BankBranch
	) {}

	async getBankList(queryParams: BankQueryParamsDto): Promise<ResponseAbstractList<Bank>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					bank_name: {
						[Op.like]: `%${q}%`
					},
					bank_code: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(await this.BankModel.findAll({ where: _whereClause }));

		return rows;
	}

	async getBankBranchList(queryParams: BankBranchQueryParamsDto): Promise<ResponseAbstractList<BankBranch>> {
		const { q, bank_code } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					branch_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (bank_code) {
			_whereClause = {
				..._whereClause,
				bank_code: bank_code
			};
		}

		const rows = parseDataSqlizeResponse(await this.BankBranchModel.findAll({ where: _whereClause }));

		return rows;
	}
}
