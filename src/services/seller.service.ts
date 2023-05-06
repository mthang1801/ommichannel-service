import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SignUpDto } from 'src/dtos/requests/auth/signup.dto';

import { Transaction } from 'sequelize';
import { SignInProviderDto } from 'src/dtos/requests/auth/signInGoogle.dto';
import { ISellerUniqueField } from 'src/interfaces/seller.interface';
import { Seller } from 'src/models/seller.model';
import { SellerCatalog } from 'src/models/sellerCatalog.model';
import { createFilterSeperator } from 'src/utils/functions.utils';

@Injectable()
export class SellerService {
	constructor(
		@InjectModel(Seller) private readonly SellerModel: typeof Seller,
		@InjectModel(SellerCatalog) private readonly SellerCatalogModel: typeof SellerCatalog
	) {}

	async create(payload: SignUpDto, transaction = null): Promise<Seller> {
		const sellerPayload = {
			seller_name: payload.seller_name || payload.fullname,
			phone: payload.phone,
			email: payload.email,
			catalog_ids: payload.catalog_id ? createFilterSeperator(String(payload.catalog_id)) : null
		};

		const options: any = {
			validate: true,
			raw: true
		};
		if (transaction) {
			options.transaction = transaction;
		}
		const sellerResult = await this.SellerModel.create<Seller>(sellerPayload, options);
		await this.SellerCatalogModel.create({ catalog_id: payload.catalog_id, seller_id: sellerResult.id }, options);
		return sellerResult;
	}

	async checkPhoneEmailExist(payload: ISellerUniqueField): Promise<boolean> {
		if (payload.phone) {
			return !!(await this.SellerModel.findOne({
				where: { phone: payload.phone }
			}));
		}

		if (payload.email) {
			return !!(await this.SellerModel.findOne({
				where: { email: payload.email }
			}));
		}
	}

	async createSellerAccountProvider(payload: SignInProviderDto, transaction: Transaction): Promise<Seller> {
		const sellerName = payload.seller_name || [payload.givenName, payload.familyName].join(' ').trim();
		const sellerPayload = {
			seller_name: sellerName,
			email: payload.email,
			phone: payload.phone,
			catalog_ids: payload.catalog_id ? createFilterSeperator(String(payload.catalog_id)) : null
		};

		const seller = await this.SellerModel.create(sellerPayload, {
			raw: true,
			transaction
		});
		await this.SellerCatalogModel.create({ catalog_id: payload.catalog_id, seller_id: seller.id }, { transaction });
		return seller;
	}
}
