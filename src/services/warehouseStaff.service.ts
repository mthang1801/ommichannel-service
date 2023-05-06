import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { WarehouseStaffQueryParamsDto } from 'src/dtos/requests/warehouseStaff/warehouseStaffQueryParams.dto';

@Injectable()
export class WarehouseStaffService {
	constructor(
		@InjectModel(WarehouseStaff)
		private readonly WarehouseStaffModel: typeof WarehouseStaff
	) {}

	async getWarehouseStaffList(
		seller_id,
		queryParams: WarehouseStaffQueryParamsDto
	): Promise<ResponseAbstractList<WarehouseStaff>> {
		const { q, level } = queryParams;

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					warehouse_staff_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (level) {
			_whereClause = {
				..._whereClause,
				level
			};
		}

		const rows = parseDataSqlizeResponse(
			await this.WarehouseStaffModel.findAll({
				where: _whereClause
			})
		);

		return rows;
	}
}
