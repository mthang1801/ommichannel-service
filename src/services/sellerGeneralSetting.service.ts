import { Injectable } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import * as fsExtra from 'fs-extra';
import { Transaction } from 'sequelize';
import { dataConstantFileName } from 'src/common/constants/constant';
import { UpdateGeneralSettingDto } from 'src/dtos/requests/generalSetting/updateGeneralSetting.dto';
import { SellerGeneralSetting } from 'src/models/sellerGeneralSetting.model';
import { getFileDataConstant, parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { sequelize } from '../configs/db';

@Injectable()
export class SellerGeneralSettingService {
	constructor(
		@InjectModel(SellerGeneralSetting)
		private readonly SellerGeneralSettingModel: typeof SellerGeneralSetting
	) {}

	async createGeneralSetting(sellerId: number, transaction: Transaction): Promise<void> {
		const generalSettingsJSON = await fsExtra.readFile(
			getFileDataConstant(dataConstantFileName.generalSettings),
			'utf8'
		);
		const generalSettingsBySellerId = (JSON.parse(generalSettingsJSON) as SellerGeneralSetting[]).map((item) => ({
			...item,
			seller_id: sellerId
		}));

		await this.SellerGeneralSettingModel.bulkCreate(generalSettingsBySellerId as any, { transaction });
		await sequelize.query(
			`
		UPDATE 
			seller_general_settings AS child INNER JOIN seller_general_settings AS parent ON child.origin_parent_id = parent.origin_id AND child.seller_id = ${sellerId} AND parent.seller_id = ${sellerId}
	  	SET
			child.parent_id = parent.id
		`,
			{ transaction }
		);
	}

	async createGeneralSettingWithoutAuth(sellerId: number): Promise<void> {
		const generalSettingsJSON = await fsExtra.readFile(
			getFileDataConstant(dataConstantFileName.generalSettings),
			'utf8'
		);
		const generalSettingsBySellerId = (JSON.parse(generalSettingsJSON) as SellerGeneralSetting[]).map((item) => ({
			...item,
			seller_id: sellerId
		}));

		await this.SellerGeneralSettingModel.bulkCreate(generalSettingsBySellerId as any);
		await sequelize.query(
			`
		UPDATE 
			seller_general_settings AS child INNER JOIN seller_general_settings AS parent ON child.origin_parent_id = parent.origin_id AND child.seller_id = ${sellerId} AND parent.seller_id = ${sellerId}
	  	SET
			child.parent_id = parent.id
		`
		);
	}

	async updateGeneralSetting(data: UpdateGeneralSettingDto): Promise<void> {
		await this.SellerGeneralSettingModel.bulkCreate(data.settings as any, {
			updateOnDuplicate: ['obj_value'],
			returning: false
		});
	}
	
	async getGeneralSettingList(sellerId : number) : Promise<SellerGeneralSetting[]> {
		const generalSettingsBySellerId = parseDataSqlizeResponse(
			await this.SellerGeneralSettingModel.findAll({ where: { seller_id: sellerId } })
		) as SellerGeneralSetting[];

		return generalSettingsBySellerId
			.filter((generalSettingItem) => generalSettingItem.parent_id === null)
			.map((ele: SellerGeneralSetting) => {
				ele['children'] = generalSettingsBySellerId.filter((item) => item.parent_id === ele.id);
				return ele;
			});
	}
}
