import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PromotionApplyMethodType } from 'src/common/constants/constant';
import { PromotionStatusEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { CreatePromotionDto } from 'src/dtos/requests/promotions/createPromotion.dto';
import { UpdateMultiplePromotionStatusDto } from 'src/dtos/requests/promotions/updateMultiplePromotionStatus.dto';
import { UpdatePromotionDto } from 'src/dtos/requests/promotions/updatePromotion.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IPromotionEntityDetail } from 'src/interfaces/promotion.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Product } from 'src/models/product.model';
import { PromotionProgram } from 'src/models/promotionProgram.model';
import { PromotionAppliedProduct } from 'src/models/promotionProgramAppliedProducts.model';
import { PromotionProgramEntity } from 'src/models/promotionProgramEntities.model';
import { PromotionProgramEntityDetail } from 'src/models/promotionProgramEntityDetail.model';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import {
	checkOnlyUpdateStatus,
	createFilterSeperator,
	getPageOffsetLimit,
	getValuesFromFilterSeperator,
	listDataParser,
	returnListWithPaging
} from 'src/utils/functions.utils';
import { sequelize } from '../configs/db';
import { GetPromotionsListDto } from '../dtos/requests/promotions/getPromotionsList.dto';
import { PromotionEntityDto } from '../dtos/requests/promotions/promotionEntity.dto';
import { Category } from '../models/category.model';
import { CategoryService } from './category.service';
import { ProductService } from './product.service';

@Injectable()
export class PromotionService {
	constructor(
		@InjectModel(PromotionProgram) private readonly PromotionProgramModel: typeof PromotionProgram,
		@InjectModel(PromotionProgramEntity)
		private readonly PromotionProgramEntityModel: typeof PromotionProgramEntity,
		@InjectModel(PromotionAppliedProduct)
		private readonly PromotionAppliedProductModel: typeof PromotionAppliedProduct,
		@InjectModel(PromotionProgramEntityDetail)
		private readonly PromotionProgramEntityDetailModel: typeof PromotionProgramEntityDetail,
		@InjectModel(Product) private readonly ProductModel: typeof Product,
		@Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
		@Inject(forwardRef(() => CategoryService)) private readonly categoryService: CategoryService
	) {}

	async createPromotion(user: IUserAuth, data: CreatePromotionDto): Promise<void> {
		try {
			CreatePromotionDto.checkPromotionProgramDataVadidation(data);
			await this.createPromotionProgramValidation(data);
			const newPromotionProgram = await this.create(user, data);
			await this.createPromotionEntities(newPromotionProgram, data.entities, user);
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.response, error.status);
		}
	}

	async updatePromotion(user: IUserAuth, programId: number, data: UpdatePromotionDto): Promise<void> {
		try {
			UpdatePromotionDto.checkPromotionProgramDataVadidation(data);
			const currentProgram = await this.findByPkAndCheckUpdateValidation(data, programId);
			const latestPromotion = await this.updateAndFindLatest(user, data, programId);
			if (checkOnlyUpdateStatus(data)) return;
			const updatedProgram = { ...data, ...latestPromotion };
			console.log('updatedProgram::', updatedProgram);
			await this.updatePromotionEntities(updatedProgram as any, user, data);
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.response, error.status);
		}
	}

	async updateMultiplePromotionStatus(
		{ sellerId }: IUserAuth,
		data: UpdateMultiplePromotionStatusDto
	): Promise<void> {
		await this.PromotionProgramModel.update(
			{ status: data.status },
			{ where: { seller_id: sellerId, id: data.promotion_ids }, logging: true }
		);
	}

	async getPromotionsList(
		{ sellerId }: IUserAuth,
		queryParams: GetPromotionsListDto
	): Promise<ResponseAbstractList<PromotionProgram>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = GetPromotionsListDto.filterPromotionProgramsList(sellerId, queryParams);
		const { rows, count } = await this.PromotionProgramModel.findAndCountAll({
			attributes: {
				include: [
					[
						sequelize.literal(`IF(max_use_quantity IS NULL, NULL, max_use_quantity - used_quantity)`),
						'remaining_use_quantity'
					]
				]
			},
			where: whereClause,
			order: [["updatedAt", "DESC"]],
			limit,
			offset,
			logging: true
		});

		return returnListWithPaging(page, limit, count, rows);
	}

	async getPromotionProgramById({ sellerId }: IUserAuth, programId: number): Promise<PromotionProgram> {
		const promotionProgram = await this.PromotionProgramModel.findOne({
			where: { seller_id: sellerId, id: programId },
			include: [{ model: PromotionProgramEntity, include: [PromotionProgramEntityDetail], required: false }],
			logging: true
		});
		if (!promotionProgram) throw new HttpException(messages.promotionProgram.notFound, HttpStatus.NOT_FOUND);
		if (
			[
				PromotionApplyMethodType['CK Tổng giá trị đơn hàng'],
				PromotionApplyMethodType['CK Áp dụng cho tất cả SP']
			].includes(promotionProgram.apply_method)
		)
			return this.handlePromotionDatetime(promotionProgram);
		const promotionEntitiesResponse = await this.getAppliedProductsByMethodType(promotionProgram);
		const promotionMergeEntityResponse = await this.promotionMergeEntityResponse(
			promotionProgram,
			promotionEntitiesResponse
		);

		const handlePromotionDatetime = this.handlePromotionDatetime(promotionMergeEntityResponse);
		const promotionResult = this.handlePromotionEntityDetails(handlePromotionDatetime);
		return promotionResult;
	}

	handlePromotionEntityDetails(promotionProgram: PromotionProgram): PromotionProgram {
		const entities = promotionProgram.entities.map((entityItem) => {
			if (![PromotionApplyMethodType['CK Tổng giá trị đơn hàng']].includes(promotionProgram.apply_method)) {
				entityItem.details = entityItem.details.map((detailItem) => {
					const payload = { ...entityItem };
					delete payload.details;
					return { ...payload, ...detailItem };
				}) as any;
			}
			return entityItem;
		});
		return { ...promotionProgram, entities } as PromotionProgram;
	}

	handlePromotionDatetime(currentProgram: PromotionProgram): PromotionProgram {
		currentProgram.utm_sources = getValuesFromFilterSeperator(currentProgram.utm_sources).map(Number) as any;
		currentProgram.customer_rankings = getValuesFromFilterSeperator(currentProgram.customer_rankings) as any;
		currentProgram.days_of_week = getValuesFromFilterSeperator(currentProgram.days_of_week).map(Number) as any;
		currentProgram.days_of_month = getValuesFromFilterSeperator(currentProgram.days_of_month).map(Number) as any;
		currentProgram.months_of_year = getValuesFromFilterSeperator(currentProgram.months_of_year).map(Number) as any;
		currentProgram.include_dates = getValuesFromFilterSeperator(currentProgram.include_dates) as any;
		currentProgram.not_include_dates = getValuesFromFilterSeperator(currentProgram.not_include_dates) as any;
		return currentProgram;
	}

	async getAppliedProductsByMethodType(promotionProgram: PromotionProgram) {
		const getAppliedProducts = {
			[PromotionApplyMethodType['CK Từng SP']]: async () =>
				await this.getAppliedSpecificProducts(promotionProgram.entities.map(({ entity_id }) => entity_id)),
			[PromotionApplyMethodType['CK Danh Mục SP']]: async () =>
				await this.getAppliedSpecificCategories(promotionProgram.entities.map(({ entity_id }) => entity_id)),
			[PromotionApplyMethodType['CK Số lượng SP']]: async () =>
				await this.getAppliedSpecificProducts(promotionProgram.entities.map(({ entity_id }) => entity_id)),
			[PromotionApplyMethodType['CK Số lượng SP (theo danh mục)']]: async () =>
				await this.getAppliedSpecificCategories(promotionProgram.entities.map(({ entity_id }) => entity_id))
		};
		const res = await getAppliedProducts[promotionProgram.apply_method]();
		console.log(res);
		return res;
	}

	async promotionMergeEntityResponse(
		promotionProgram: PromotionProgram,
		promotionEntitiesResponse: Product[] | Category[]
	) {
		const mergePromotionEntity = promotionProgram.entities.map((promotionEntity) => {
			const entityData = listDataParser<any>(promotionEntitiesResponse).find(
				({ id }): any => id === promotionEntity.entity_id
			);
			return {
				...promotionEntity.toJSON(),
				...entityData
			};
		});
		const promotionProgramJSON = promotionProgram.toJSON();
		promotionProgramJSON.entities = mergePromotionEntity as any[];
		return promotionProgramJSON;
	}

	async getAppliedSpecificProducts(productIds: number[]): Promise<Product[]> {
		return await this.productService.findAllByProductIds(productIds);
	}
	async getAppliedSpecificCategories(categoryIds: number[]): Promise<any> {
		return await this.categoryService.findAllByCatIds(categoryIds);
	}

	async createPromotionProgramValidation({ program_code }: CreatePromotionDto): Promise<void> {
		const programExist = await this.PromotionProgramModel.findOne({
			where: { program_code },
			logging: true
		});

		if (programExist) throw new HttpException(messages.promotionProgram.duplicateProgram, HttpStatus.CONFLICT);
	}

	async findByPkAndCheckUpdateValidation(
		{ program_code, status }: UpdatePromotionDto,
		programId: number
	): Promise<PromotionProgram> {
		console.log(programId);
		const programExist = await this.PromotionProgramModel.findOne({
			where: { program_code, id: { [Op.ne]: programId } },
			logging: true,
			raw: true
		});

		if (programExist) throw new HttpException(messages.promotionProgram.duplicateProgram, HttpStatus.CONFLICT);
		const currentProgram = await this.PromotionProgramModel.findByPk(programId);
		if (status) {
			switch (status) {
				case PromotionStatusEnum['Hoạt động']:
				case PromotionStatusEnum['Tạm dừng']:
				case PromotionStatusEnum['Chưa kích hoạt']:
					{
						if (currentProgram.status === PromotionStatusEnum['Ngừng hoạt động'])
							throw new HttpException(
								messages.promotionProgram.updateInvalidStatus,
								HttpStatus.BAD_REQUEST
							);
					}
					break;
				case PromotionStatusEnum['Ngừng hoạt động']:
					{
						if (currentProgram.status !== status)
							throw new HttpException(
								messages.promotionProgram.updateInvalidStatus,
								HttpStatus.BAD_REQUEST
							);
					}
					break;
			}
		}
		return currentProgram;
	}

	async create({ sellerId, userId }: IUserAuth, data: CreatePromotionDto): Promise<PromotionProgram> {
		const promotionPayload = {
			...data,
			customer_rankings: data?.customer_rankings?.length ? createFilterSeperator(data.customer_rankings) : null,
			utm_sources: data?.utm_sources?.length ? createFilterSeperator(data.utm_sources) : null,
			days_of_week: data?.days_of_week?.length ? createFilterSeperator(data.days_of_week) : null,
			days_of_month: data?.days_of_month?.length ? createFilterSeperator(data.days_of_month) : null,
			months_of_year: data?.months_of_year?.length ? createFilterSeperator(data.months_of_year) : null,
			include_dates: data?.include_dates?.length ? createFilterSeperator(data.include_dates) : null,
			not_include_dates: data?.not_include_dates?.length ? createFilterSeperator(data.not_include_dates) : null,
			seller_id: sellerId,
			created_by: userId,
			updated_by: userId
		};
		return (
			await this.PromotionProgramModel.create(promotionPayload as any, {
				logging: true,
				raw: true
			})
		).toJSON();
	}

	async updateAndFindLatest(
		{ userId, sellerId }: IUserAuth,
		data: UpdatePromotionDto,
		programId: number
	): Promise<PromotionProgram> {
		const promotionPayload = {
			...data,
			id: programId,
			seller_id: sellerId,
			customer_rankings: data?.customer_rankings?.length ? createFilterSeperator(data.customer_rankings) : null,
			utm_sources: data?.utm_sources?.length ? createFilterSeperator(data.utm_sources) : null,
			days_of_week: data?.days_of_week?.length ? createFilterSeperator(data.days_of_week) : null,
			days_of_month: data?.days_of_month?.length ? createFilterSeperator(data.days_of_month) : null,
			months_of_year: data?.months_of_year?.length ? createFilterSeperator(data.months_of_year) : null,
			include_dates: data?.include_dates?.length ? createFilterSeperator(data.include_dates) : null,
			not_include_dates: data?.not_include_dates?.length ? createFilterSeperator(data.not_include_dates) : null,
			updated_by: userId
		};
		await this.PromotionProgramModel.update(promotionPayload as any, { where: { id: programId }, logging: true });
		console.log('promotionPayload::', promotionPayload);
		return promotionPayload as PromotionProgram;
	}

	async createPromotionEntities(
		currentPromotion: PromotionProgram,
		entities: PromotionEntityDto[],
		user: IUserAuth,
		isUpdate = false
	): Promise<void> {
		const promotionEntitiesResponse = await this.bulkCreateProgramEntities(currentPromotion, entities, isUpdate);

		await Promise.all([
			this.bulkCreateProgramEntityDetails(currentPromotion, entities, promotionEntitiesResponse, isUpdate),
			this.createPromotionAppliedProducts(currentPromotion, promotionEntitiesResponse, user, isUpdate)
		]);
	}

	async updatePromotionEntities(
		currentPromotion: PromotionProgram,
		user: IUserAuth,
		data: UpdatePromotionDto
	): Promise<void> {
		await this.createPromotionEntities(currentPromotion, data.entities, user, true);
	}

	async removePromotionEntities(entityIds: number[]): Promise<void> {
		await this.PromotionProgramEntityModel.destroy({ where: { id: entityIds } });
	}

	async removePromotionEntityDetails(detailIds: number[]): Promise<void> {
		await this.PromotionProgramEntityDetailModel.destroy({ where: { id: detailIds } });
	}

	async bulkCreateProgramEntities(
		currentPromotion: PromotionProgram,
		entities: PromotionEntityDto[],
		isUpdate = false
	): Promise<PromotionProgramEntity[]> {
		if (isUpdate) {
			await this.PromotionProgramEntityModel.destroy({
				where: { program_id: currentPromotion.id },
				logging: true
			});
		}
		const promotionEntitiesPayload = entities.map(({ entity_id }) => ({
			program_id: currentPromotion.id,
			seller_id: currentPromotion.seller_id,
			entity_id,
			apply_method: currentPromotion.apply_method
		}));
		return this.PromotionProgramEntityModel.bulkCreate(promotionEntitiesPayload as any, {
			logging: true
		});
	}

	async bulkCreateProgramEntityDetails(
		currentPromotion: PromotionProgram,
		entities: PromotionEntityDto[],
		promotionEntitiesResponse: PromotionProgramEntity[],
		isUpdate = false
	) {
		if (isUpdate) {
			await this.PromotionProgramEntityDetailModel.destroy({ where: { program_id: currentPromotion.id } });
		}
		const promotionEntityForDetailsPayload: IPromotionEntityDetail[] = entities.reduce(
			(acc: IPromotionEntityDetail[], { entity_id, details }): any => {
				const promotionDetailsByPromotionEntityId: IPromotionEntityDetail[] = details.map((detail) => ({
					...detail,
					max_use_quantity: detail.max_use_quantity,
					used: detail.max_use_quantity ? detail.used_quantity || 0 : null,
					program_id: currentPromotion.id,
					seller_id: currentPromotion.seller_id,
					promotion_entity_id:
						currentPromotion.apply_method === PromotionApplyMethodType['CK Tổng giá trị đơn hàng']
							? promotionEntitiesResponse[0].id
							: promotionEntitiesResponse.find((entity) => entity.entity_id === entity_id)?.id
				}));
				acc = acc.concat(promotionDetailsByPromotionEntityId);
				return acc;
			},
			[]
		);
		await this.PromotionProgramEntityDetailModel.bulkCreate(promotionEntityForDetailsPayload as any, {
			logging: true
		});
	}

	async createPromotionAppliedProducts(
		currentPromotion: PromotionProgram,
		entities: PromotionProgramEntity[],
		user: IUserAuth,
		isUpdate = false
	) {
		if (isUpdate) {
			await this.destroyAppliedProductsByProgramId(currentPromotion.id);
		}
		if (currentPromotion.apply_method === PromotionApplyMethodType['CK Tổng giá trị đơn hàng']) return;

		const createAppliedProducts = {
			[PromotionApplyMethodType['CK Áp dụng cho tất cả SP']]: async () =>
				await this.createForAllAppliedProducts(currentPromotion, entities, user),
			[PromotionApplyMethodType['CK Từng SP']]: async () =>
				await this.createForAppliedSpecificProducts(currentPromotion, entities),
			[PromotionApplyMethodType['CK Danh Mục SP']]: async () =>
				await this.createAppliedProductsByCategory(currentPromotion, entities),
			[PromotionApplyMethodType['CK Số lượng SP']]: async () =>
				await this.createForAppliedSpecificProducts(currentPromotion, entities),
			[PromotionApplyMethodType['CK Số lượng SP (theo danh mục)']]: async () =>
				await this.createAppliedProductsByCategory(currentPromotion, entities)
		};
		if (currentPromotion.apply_all_products) {
			await this.createForAllAppliedProducts(currentPromotion, entities, user);
			return;
		}
		await createAppliedProducts[currentPromotion.apply_method]();
	}

	async createForAllAppliedProducts(
		currentPromotion: PromotionProgram,
		entities: PromotionProgramEntity[],
		user: IUserAuth
	): Promise<void> {
		const allProductsList = await this.productService.findAllProducts(user);
		if (!allProductsList.length) return;
		const promotionForAllAppliedProductsPayload = entities.reduce((acc, { id }) => {
			const productsListPayload = allProductsList.map((productItem) => {
				const payload = {
					...currentPromotion,
					program_id: currentPromotion.id,
					seller_id: currentPromotion.seller_id,
					product_id: productItem.id,
					promotion_entity_id: id,
					created_at: formatMySQLTimeStamp(currentPromotion.createdAt),
					updated_at: formatMySQLTimeStamp()
				};
				delete payload.id;
				return payload;
			});
			acc = acc.concat(productsListPayload);
			return acc;
		}, []);

		await this.PromotionAppliedProductModel.bulkCreate(promotionForAllAppliedProductsPayload as any, {
			logging: true
		});
	}

	async createForAppliedSpecificProducts(
		currentPromotion: PromotionProgram,
		entities: PromotionProgramEntity[]
	): Promise<void> {
		const promotionAppliedProductsPayload = entities.map(({ entity_id, id }) => {
			const payload = {
				...currentPromotion,
				program_id: currentPromotion.id,
				seller_id: currentPromotion.seller_id,
				product_id: entity_id,
				promotion_entity_id: id,
				created_at: formatMySQLTimeStamp(currentPromotion.createdAt),
				updated_at: formatMySQLTimeStamp()
			};
			delete payload.id;
			return payload;
		});
		await this.PromotionAppliedProductModel.bulkCreate(promotionAppliedProductsPayload as any, { logging: true });
	}

	async createAppliedProductsByCategory(
		currentPromotion: PromotionProgram,
		entities: PromotionProgramEntity[]
	): Promise<void> {
		const productsByCategoryEntities = await this.productService.findProductByBulkCategoryIds(
			entities.map(({ entity_id }) => entity_id)
		);
		const promotionAppliedProductsPayload = productsByCategoryEntities.map(({ product_id, category_id }) => {
			const entityForProduct = entities.find((catEntity) => catEntity.entity_id === category_id);
			const payload = {
				...currentPromotion,
				promotion_entity_id: entityForProduct.id,
				entity_id: entityForProduct.entity_id,
				program_id: currentPromotion.id,
				seller_id: currentPromotion.seller_id,
				product_id
			};
			delete payload.id;
			return payload;
		});
		await this.PromotionAppliedProductModel.bulkCreate(promotionAppliedProductsPayload as any, { logging: true });
	}

	async destroyAppliedProductsByProgramId(programId: number): Promise<void> {
		await this.PromotionAppliedProductModel.destroy({ where: { program_id: programId } });
	}
}
