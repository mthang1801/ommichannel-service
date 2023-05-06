import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UnitQueryParamsDto } from 'src/dtos/requests/unit/unitQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Unit } from 'src/models/unit.model';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';

@Injectable()
export class UnitService {
	constructor(
		@InjectModel(Unit)
		private readonly UnitModel: typeof Unit
	) {}
	
	async getUnitList(queryParams: UnitQueryParamsDto): Promise<ResponseAbstractList<Unit>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					unit: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(await this.UnitModel.findAll({ where: _whereClause }));

		return rows;
	}
}
