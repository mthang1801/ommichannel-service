import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { PathUrlObjectTypeEnum } from 'src/common/constants/enum';
import { CreatePathUrlDto } from 'src/dtos/requests/urlPath/createPathUrl.dto';
import { PathUrl } from 'src/models/pathUrl.model';

@Injectable()
export class PathUrlStorageService {
	constructor(@InjectModel(PathUrl) private readonly PathUrlModel: typeof PathUrl) {}

	async createPathUrls(data: CreatePathUrlDto, transaction?: Transaction): Promise<void> {
		const pathUrlsPayload = data.path_urls.reduce((acc, pathUrl) => {
			const pathUrlPayload = {
				object_id: data.object_id,
				object_type: data.object_type,
				...pathUrl
			};
			acc.push(pathUrlPayload);
			return acc;
		}, []);

		await this.PathUrlModel.bulkCreate(pathUrlsPayload, { transaction });
	}

	async getPathUrls(objectId: number, objectType: PathUrlObjectTypeEnum): Promise<PathUrl[]> {
		return this.PathUrlModel.findAll({
			where: { object_id: objectId, object_type: objectType }
		});
	}

	async destroysAll(objectId: number, objectType: PathUrlObjectTypeEnum, transaction: Transaction): Promise<void> {
		await this.PathUrlModel.destroy({
			where: { object_id: objectId, object_type: objectType },
			transaction
		});
	}
}
