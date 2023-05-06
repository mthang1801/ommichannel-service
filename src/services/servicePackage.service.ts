import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { FIXED_SERVICE_PACKAGE_ID } from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { SPECIAL_ADMIN_SELLER_ID } from 'src/common/guards/auth';
import { cachingKey } from 'src/configs/caching';
import { CreateServicePackageDto } from 'src/dtos/requests/servicePackage/createServicePackage.dto';
import { GetServicePackagesListDto } from 'src/dtos/requests/servicePackage/getServicePackagesList.dto';
import { UpdateServicePackageDto } from 'src/dtos/requests/servicePackage/updateServicePacakge.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { CachingService } from 'src/microservices/caching/caching.service';
import { BenefitPackage } from 'src/models/benefitPackage';
import { SellerServicePackage } from 'src/models/sellerServicePackages.model';
import { ServiceBenefitPackage } from 'src/models/serviceBenefitPackage.model';
import { ServicePackage } from 'src/models/servicePackage.model';
import { dateFormatYMD, dateFromNow, today } from 'src/utils/dates.utils';
import { dataJSONParser, getPageOffsetLimit, listDataParser, returnListWithPaging } from 'src/utils/functions.utils';
@Injectable()
export class ServicePackageService {
	constructor(
		private readonly cachingService: CachingService,
		@InjectModel(BenefitPackage) private readonly BenefitPackageModel: typeof BenefitPackage,
		@InjectModel(ServiceBenefitPackage) private readonly ServiceBenefitPackageModel: typeof ServiceBenefitPackage,
		@InjectModel(ServicePackage) private readonly ServicePackageModel: typeof ServicePackage,
		@InjectModel(SellerServicePackage) private readonly SellerServicePackageModel: typeof SellerServicePackage
	) {}

	async getAllBenefits(): Promise<BenefitPackage[]> {
		const key = cachingKey.benefitPackages;
		const responseData: string = await this.cachingService.get(key);
		if (responseData) return dataJSONParser<BenefitPackage[]>(responseData);
		const benefitPackagesData = listDataParser<BenefitPackage>(await this.BenefitPackageModel.findAll());
		this.cachingService.set(key, JSON.stringify(benefitPackagesData));
		return benefitPackagesData;
	}

	async createServicePackage(data: CreateServicePackageDto): Promise<void> {
		const servicePackage = await this.ServicePackageModel.create(data as any, {});
		if (data.benefits.length) {
			const benefitsPackageData = data.benefits.map((benefitPackageId) => ({
				benefit_id: benefitPackageId,
				service_id: servicePackage.id
			}));

			await this.ServiceBenefitPackageModel.bulkCreate(benefitsPackageData, {
				ignoreDuplicates: true,
				logging: true
			});
		}
	}

	async updateServicePackage(id: number, data: UpdateServicePackageDto): Promise<void> {
		await this.ServicePackageModel.update(data as any, { where: { id } });

		if (data.benefits) {
			await this.ServiceBenefitPackageModel.destroy({ where: { service_id: id } });
			const benefitsPackageData = data.benefits.map((benefitPackageId) => ({
				benefit_id: benefitPackageId,
				service_id: id
			}));

			await this.ServiceBenefitPackageModel.bulkCreate(benefitsPackageData, {
				ignoreDuplicates: true,
				logging: true
			});
		}

		await this.removeSellerPackageCache();
	}

	async removeSellerPackageCache() {
		const packageKeys = cachingKey.allKeysSellerServicePackage;
		const keys = await this.cachingService.command('keys', [packageKeys]);
		await this.cachingService.command('del', ['key', ...keys]);
	}

	async getServicePackage(id: number): Promise<ServicePackage> {
		return this.ServicePackageModel.findByPk(id, {
			include: [BenefitPackage],
			attributes: {
				include: [
					[
						Sequelize.literal(
							`(SELECT COUNT(DISTINCT(seller_id)) FROM seller_service_packages WHERE ServicePackage.id = seller_service_packages.service_package_id AND seller_service_packages.status = 1 AND end_at > CURRENT_DATE())`
						),
						'number_users_using'
					]
				]
			}
		});
	}

	async getServicePackagesList(
		queryParams: GetServicePackagesListDto
	): Promise<ResponseAbstractList<ServicePackage>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = GetServicePackagesListDto.getPackageServiceListQueryParams(queryParams);
		const { rows, count } = await this.ServicePackageModel.findAndCountAll({
			attributes: {
				include: [
					[
						Sequelize.literal(
							`(SELECT COUNT(DISTINCT(seller_id)) FROM seller_service_packages WHERE ServicePackage.id = seller_service_packages.service_package_id AND seller_service_packages.status = 1 AND end_at > CURRENT_DATE())`
						),
						'number_users_using'
					]
				]
			},
			where: whereClause,
			offset,
			limit
		});

		return returnListWithPaging<ServicePackage>(page, limit, count, rows);
	}

	async createServicePackageFreeTrialFromSignUp(sellerId: number, userId: number, transaction) {
		const payloadData = {
			seller_id: sellerId,
			service_package_id: FIXED_SERVICE_PACKAGE_ID.BASIC,
			start_at: today(dateFormatYMD),
			end_at: dateFromNow(30, dateFormatYMD),
			created_by: userId,
			updated_by: userId
		};
		const [createRes, svgPackageById] = await Promise.all([
			this.SellerServicePackageModel.create(payloadData, { transaction }),
			this.ServicePackageModel.findByPk(FIXED_SERVICE_PACKAGE_ID.BASIC)
		]);
		const res = { ...createRes.toJSON() };
		res.service_package = svgPackageById.toJSON();
		await this.setCachePackageService(sellerId, res);
	}

	async setCachePackageService(sellerId: number, data: SellerServicePackage) {
		const cacheKey = cachingKey.sellerServicePackage(sellerId);
		const ttl = Math.floor((new Date(data.end_at).getTime() - Date.now()) / 1000);		
		await this.cachingService.set(cacheKey, JSON.stringify(data), ttl);
	}

	async getCurrentServicePackageBySellerIdFromCache(sellerId: number): Promise<SellerServicePackage> {
		const cacheKey = cachingKey.sellerServicePackage(sellerId);
		const currentServicePackage = await this.cachingService.get(cacheKey);
		if (!currentServicePackage) return null;
		return JSON.parse(currentServicePackage) as SellerServicePackage;
	}

	async getCurrentServicePackageBySellerId(sellerId: number): Promise<SellerServicePackage> {
		if (sellerId === SPECIAL_ADMIN_SELLER_ID) return null;
		const svcPackageFromCacheData = await this.getCurrentServicePackageBySellerIdFromCache(sellerId);
		if (svcPackageFromCacheData) return svcPackageFromCacheData;
		const svcPackageFromDB = await this.findNewestServicePackageBySellerId(sellerId);
		this.checkSvcPackageValidation(svcPackageFromDB);
		await this.setCachePackageService(sellerId, svcPackageFromDB.toJSON());
		return svcPackageFromDB;
	}

	async findNewestServicePackageBySellerId(sellerId: number): Promise<SellerServicePackage> {
		return await this.SellerServicePackageModel.findOne({
			where: { seller_id: sellerId, status: true },
			include: [ServicePackage],
			order: [['start_at', 'DESC']]
		});
	}

	checkSvcPackageValidation(svcPackageFromDB: SellerServicePackage): void {
		if (!svcPackageFromDB) throw new HttpException(messages.servicePackage.servicePackageNotExist, 408);
		if (new Date(`${svcPackageFromDB.end_at} 23:59:59`).getTime() < Date.now()) {
			throw new HttpException(messages.servicePackage.servicePackageHasExipred, 408);
		}
	}
}
