import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { WardQueryParamsDto } from 'src/dtos/requests/ward/wardQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Ward } from 'src/models/ward.model';

@Injectable()
export class WardService {
	constructor(@InjectModel(Ward) private readonly WardModel: typeof Ward) {}

	async getWardList(queryParams: WardQueryParamsDto): Promise<ResponseAbstractList<Ward>> {
		const { q, district_id } = queryParams;
		// const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					ward_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (district_id) {
			_whereClause = {
				..._whereClause,
				district_id
			};
		}

		return {
			data: await this.WardModel.findAll({
				where: _whereClause,
				order: [['ward_name', 'ASC']]
			})
		};
	}
}
