import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ProvinceQueryParamsDto } from 'src/dtos/requests/province/provinceQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { District } from 'src/models/district.model';
import { Province } from 'src/models/province.model';
import { Ward } from 'src/models/ward.model';

@Injectable()
export class ProvinceService {
	constructor(
		@InjectModel(Province) private readonly ProvinceModel: typeof Province,
		@InjectModel(District) private readonly DistrictModel: typeof District,
		@InjectModel(Ward) private readonly WardModel: typeof Ward
	) {}

	async getProvinceList(queryParams: ProvinceQueryParamsDto = null): Promise<ResponseAbstractList<Province>> {
		const { q } = queryParams;
		// const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					province_name: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		return {
			data: await this.ProvinceModel.findAll({
				where: _whereClause,
				order: [['province_name', 'ASC']]
			})
		};
	}
}
