import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DistrictQueryParamsDto } from 'src/dtos/requests/district/districtQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { District } from 'src/models/district.model';
import { Ward } from 'src/models/ward.model';
import { isEmptyObject } from 'src/utils/functions.utils';

@Injectable()
export class DistrictService {
	constructor(
		@InjectModel(District) private readonly DistrictModel: typeof District,
		@InjectModel(Ward) private readonly WardModel: typeof Ward
	) {}

	async getDistrictList(queryParams: DistrictQueryParamsDto): Promise<ResponseAbstractList<District>> {
		const { q, province_id } = queryParams;

		const whereClause: any = [{ q }, { province_id }]
			.filter((item) => !isEmptyObject(item))
			.reduce((_whereClause, ele) => {
				Object.entries(ele).map(([key, val]) => {
					switch (key) {
						case 'q':
							_whereClause['district_name'] = {
								[Op.like]: `%${q}%`
							};
							break;
						case 'province_id':
							{
								_whereClause[key] = val;
							}
							break;
					}
				});
				return _whereClause;
			}, {});

		return {
			data: await this.DistrictModel.findAll({
				where: whereClause,
				order: [['district_name', 'ASC']]
			})
		};
	}
}
