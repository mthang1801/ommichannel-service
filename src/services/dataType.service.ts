import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { DataTypes } from 'src/models/dataType.model';
import { DataTypeQueryParamsDto } from 'src/dtos/requests/dataType/dataTypeQueryParams.dto';
import { Op } from 'sequelize';

@Injectable()
export class DataTypeService {
	constructor(
		@InjectModel(DataTypes)
		private readonly DataTypeModel: typeof DataTypes
	) {}

	async getDataTypeList(queryParams: DataTypeQueryParamsDto): Promise<ResponseAbstractList<DataTypes>> {
		const { q } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					description: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		const rows = parseDataSqlizeResponse(
			await this.DataTypeModel.findAll({
				where: _whereClause
			})
		);

		return rows;
	}
}
