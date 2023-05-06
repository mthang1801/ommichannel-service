import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse, getPageOffsetLimit } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { Platform } from 'src/models/platform.model';
import { PlatformQueryParamsDto } from 'src/dtos/requests/platform/platformQueryParams.dto';

@Injectable()
export class PlatformService {
	constructor(@InjectModel(Platform) private readonly PlatformModel: typeof Platform) {}

	async getPlatformList(queryParams: PlatformQueryParamsDto): Promise<any> {
		const { q, type } = queryParams;

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					platform_name: {
						[Op.like]: `%${q}%`
					},
					platform_code: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (type) {
			_whereClause = {
				..._whereClause,
				type
			};
		}

		const platforms = await this.PlatformModel.findAll({
			where: _whereClause
		});

		return platforms;
	}
}
