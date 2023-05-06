import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op, Sequelize, Transaction } from 'sequelize';
import { filterSeperator, ProductsLogsFieldsList } from 'src/common/constants/constant';
import {
	PathUrlObjectTypeEnum,
	ProductInventoryOperatorEnum,
	ProductLevelEnum,
	ProductLogTypeEnum,
	ProductStatusEnum,
	ProductTabEnum,
	ProductTypeEnum
} from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { sequelize } from 'src/configs/db';
import { ProductPayload } from 'src/dtos/productPayload.dto';
import { CreateProductDTO } from 'src/dtos/requests/products/createProduct.dto';
import { ImportProductDto } from 'src/dtos/requests/products/importProduct.dto';
import { ProductLogQueryParamsDto } from 'src/dtos/requests/products/productLogQueryParams.dto';
import { ProductQueryParams } from 'src/dtos/requests/products/productQueryParams.dto';
import { ProductVariation } from 'src/dtos/requests/products/productVariation.dto';
import { UpdateProductDTO } from 'src/dtos/requests/products/updateProduct.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Attribute } from 'src/models/attribute.model';
import { AttributeValue } from 'src/models/attributeValue.model';
import { Category } from 'src/models/category.model';
import { Product } from 'src/models/product.model';
import { ProductAttribute } from 'src/models/productAttribute.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { ProductLog } from 'src/models/productLog.model';
import { ProductLogDetail } from 'src/models/productLogDetail.model';
import { ProductPriceHistory } from 'src/models/productPriceHistory.model';
import { ProductStockHistory } from 'src/models/productStockHistories.model';
import { ProductVariationAttribute } from 'src/models/productVariationAttribute.model';
import { getIdByDynamicDataList } from 'src/utils/exceljs.helper';
import {
	checkOnlyUpdateStatus,
	filterData,
	getKeyByValue,
	getPageOffsetLimit,
	isEmptyObject,
	mapCategoriesListArrayIntoString,
	mapCategoriesListStringIntoArray,
	parseDataSqlizeResponse,
	typeOf
} from 'src/utils/functions.utils';
import { ProductAttributeDto } from '../dtos/requests/products/productAttribute.dto';
import { Catalog } from '../models/catalog.model';
import { CategoryService } from './category.service';
import { PathUrlStorageService } from './pathUrlStorage.service';
@Injectable()
export class ProductService {
	constructor(
		@InjectModel(Product) private readonly ProductModel: typeof Product,
		@InjectModel(ProductPriceHistory)
		private readonly ProductPriceHistoryModel: typeof ProductPriceHistory,
		@InjectModel(ProductStockHistory)
		private readonly ProductStockHistoryModel: typeof ProductStockHistory,
		@InjectModel(ProductAttribute)
		private readonly ProductAttributeModel: typeof ProductAttribute,
		@InjectModel(ProductCategory)
		private readonly ProductCategoryModel: typeof ProductCategory,
		@InjectModel(ProductLog)
		private readonly ProductLogModel: typeof ProductLog,
		@InjectModel(ProductInventory)
		private readonly ProductInventoryModel: typeof ProductInventory,
		@InjectModel(ProductVariationAttribute)
		private readonly ProductVariationAttributeModel: typeof ProductVariationAttribute,
		private readonly pathUrlStorageService: PathUrlStorageService,
		@Inject(forwardRef(() => CategoryService))
		private readonly categoryService: CategoryService,
		private schedulerRegistry: SchedulerRegistry
	) {}

	async createProduct(data: CreateProductDTO, user: IUserAuth): Promise<any> {
		const transaction = await sequelize.transaction();
		try {
			const { sellerId, userId, roleCode } = user;
			const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
			await this.checkCreateProductValidation(sellerId, data, isSpecialAdmin);

			await this.handleOtherProductsLevel(data, transaction);

			const productLevel = this.determineProductLevel(data);

			const categoriesList = mapCategoriesListArrayIntoString(data.categories_list);
			const rootCategoryUrl = await this.categoryService.findRootCategorySlugFromListCategories(
				sellerId,
				data.categories_list
			);

			const attributesList = this.genAttributesStringList(data.attributes);

			const productPayload: any = {
				...data,
				seller_id: isSpecialAdmin ? null : sellerId,
				product_level: productLevel,
				categories_list: categoriesList,
				root_category_url: rootCategoryUrl,
				attribute_ids_list: attributesList,
				created_by: userId,
				updated_by: userId
			};

			const productResponse = await this.ProductModel.create(productPayload, {
				transaction
			});

			const productResult = parseDataSqlizeResponse(productResponse);
			const productsIdsList = [productResponse.id];

			if (data?.product_variations.length && productResult.product_level === ProductLevelEnum.Configure) {
				const productVariationsPayload = data.product_variations.map((productVariationItem) => {
					const productVariationPayload = {
						...data,
						...productVariationItem,
						parent_id: productResult.id,
						seller_id: isSpecialAdmin ? null : sellerId,
						product_level: ProductLevelEnum.Variation,
						categories_list: categoriesList,
						root_category_url: rootCategoryUrl,
						attributes: productVariationItem.attributes.map((item) => ({
							attribute_id: item.attribute_id,
							value_ids: item.value_id
						})),
						specific_attributes: this.getSpecificAttributes(productVariationItem.attributes),
						created_by: userId,
						updated_by: userId
					};
					delete productVariationPayload.url;
					return productVariationPayload;
				});

				const productChildrenResponse = await this.ProductModel.bulkCreate(productVariationsPayload as any[], {
					include: [{ association: 'attributes' }],
					transaction
				});

				const productVariationAttributesPayload = data.product_variations.reduce(
					(acc, productVariationItem) => {
						const productChildren = productChildrenResponse.find(
							(productItem) => productItem.barcode === productVariationItem.barcode
						);
						if (productChildren) {
							const productVariationPayload = productVariationItem.attributes.map((item) => ({
								value_id: item.value_id,
								product_id: productChildren.id
							}));
							acc = acc.concat(productVariationPayload);
						}
						return acc;
					},
					[]
				);

				await this.ProductVariationAttributeModel.bulkCreate(productVariationAttributesPayload, {
					transaction
				});

				productChildrenResponse.forEach((producutChildrenItem) => {
					productsIdsList.push(producutChildrenItem.id);
				});
			}

			if (data.categories_list.length) {
				const productCategoriesList = productsIdsList.reduce((acc, productId) => {
					acc = acc.concat(
						data.categories_list.map((categoryId) => ({
							category_id: categoryId,
							product_id: productId
						}))
					);

					return acc;
				}, []);

				await this.ProductCategoryModel.bulkCreate(productCategoriesList as any, {
					ignoreDuplicates: true,
					transaction
				});
			}

			if (data?.image_urls?.length) {
				const productImagePayload = {
					object_id: productResult.id,
					object_type: PathUrlObjectTypeEnum.PRODUCT,
					path_urls: data.image_urls.map((imageUrl, index) => ({
						path_url: imageUrl,
						index,
						offset_width: null,
						offset_height: null
					}))
				};
				await this.pathUrlStorageService.createPathUrls(productImagePayload, transaction);
			}

			if (data.attributes.length) {
				const attributesList = data.attributes.map((attributeItem) => ({
					...attributeItem,
					product_id: productResponse.id
				}));

				await this.ProductAttributeModel.bulkCreate(attributesList, {
					transaction
				});
			}

			await Promise.all([
				this.writeDataIntoProductLog(
					productResponse.id,
					productResult,
					null,
					ProductLogTypeEnum['Tạo sản phẩm'],
					userId,
					transaction
				)
			]);
			await transaction.commit();
			const productCountInCategories = await this.categoryService.getUniqueProductCountInCat(
				user,
				data.categories_list
			);

			if (productCountInCategories.length) {
				await this.categoryService.updateProductCountInCategories(productCountInCategories);
			}
		} catch (error) {
			await transaction.rollback();
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	determineProductLevel(data) {
		if (data.parent_id) {
			return ProductLevelEnum.Variation;
		} else if (data?.product_variations?.length) {
			return ProductLevelEnum.Configure;
		}
		return ProductLevelEnum.Independence;
	}

	genAttributesStringList(attributes: ProductAttributeDto[]) {
		return attributes?.length
			? attributes
					.map(({ value_ids }) =>
						value_ids
							.replace(/(\]|\[)/g, '')
							.split(',')
							.map((valueId) =>
								typeOf(valueId) === 'number' ? `${filterSeperator}${valueId}${filterSeperator}` : null
							)
							.filter(Boolean)
					)
					.filter(Boolean)
					.join(',')
			: null;
	}

	getSpecificAttributes(attributesList: { attribute_id: number; value_id: number }[]) {
		return attributesList.map(({ value_id }) => `${filterSeperator}${value_id}${filterSeperator}`).join(',');
	}

	async checkCreateProductValidation(sellerId: number, data: ProductPayload, isSpecialAdmin: boolean) {
		let whereClause: any = {};
		if (data?.product_variations?.length) {
			if (data.parent_id) {
				throw new HttpException(messages.product.productChildrenShouldNotVariation, HttpStatus.BAD_REQUEST);
			}
			const barcodeCollection = [];
			const skuCollection = [];
			for (const productVariationItem of data.product_variations) {
				if (productVariationItem.barcode) {
					if (barcodeCollection.includes(productVariationItem.barcode)) {
						throw new HttpException(messages.product.barcodeExist, HttpStatus.CONFLICT);
					} else {
						barcodeCollection.push(productVariationItem.barcode);
					}
				}

				if (productVariationItem.sku) {
					if (skuCollection.includes(productVariationItem.sku)) {
						throw new HttpException(messages.product.skuExist, HttpStatus.CONFLICT);
					} else {
						skuCollection.push(productVariationItem.sku);
					}
				}
			}

			whereClause = {
				[Op.or]: [
					{ sku: { [Op.in]: [data.sku, ...skuCollection] } },
					{
						barcode: {
							[Op.in]: [data.barcode, ...barcodeCollection]
						}
					}
				]
			};
		} else {
			whereClause = {
				[Op.or]: [{ sku: data.sku }, { barcode: data.barcode }]
			};
		}

		if (data.url) {
			whereClause = {
				[Op.or]: {
					...whereClause,
					url: data.url
				}
			};
		}

		const productSkuOrBarcodeExist = await this.ProductModel.findOne({
			where: {
				seller_id: isSpecialAdmin ? null : sellerId,
				...whereClause
			}
		});

		if (productSkuOrBarcodeExist) {
			throw new HttpException(messages.product.skuOrBarcodeExist, HttpStatus.CONFLICT);
		}

		if (data?.categories_list?.length > 5) {
			throw new HttpException(messages.product.overCategoriesLimitation, HttpStatus.BAD_REQUEST);
		}
	}

	async handleOtherProductsLevel(data: ProductPayload, transaction: Transaction): Promise<void> {
		if (data.parent_id) {
			const parentProduct = await this.ProductModel.findOne({
				where: { id: data.parent_id }
			});

			if (!parentProduct) {
				throw new HttpException(messages.product.parentProductNotFound, HttpStatus.NOT_FOUND);
			}

			if (parentProduct.product_level === ProductLevelEnum.Variation) {
				throw new HttpException(messages.product.productChildrenShouldNotVariation, HttpStatus.BAD_REQUEST);
			}

			// If product is independent, update this one upto configure
			if (parentProduct.product_level === ProductLevelEnum.Independence) {
				await this.cloneProductIndependentIntoVariation(parentProduct, transaction);
				await this.ProductModel.update(
					{ product_level: ProductLevelEnum.Configure },
					{ where: { id: data.parent_id }, transaction }
				);
			}
		}
	}

	async cloneProductIndependentIntoVariation(product: Product, transaction: Transaction): Promise<void> {
		const productPayload = {
			...product,
			parent_id: product.id,
			product_level: ProductLevelEnum.Variation
		};
		delete productPayload.id;
		const clonedProduct = await this.ProductModel.create(productPayload as any, { transaction });

		const productPriceHistories = await this.ProductPriceHistoryModel.findAll({
			where: { product_id: product.id }
		});
		if (productPriceHistories.length) {
			await this.ProductPriceHistoryModel.update(
				{ product_id: clonedProduct.id },
				{ where: { product_id: product.id }, transaction }
			);
		}

		const productStockHistories = await this.ProductStockHistoryModel.findAll({
			where: { product_id: product.id }
		});
		if (productStockHistories.length) {
			await this.ProductStockHistoryModel.update(
				{ product_id: clonedProduct.id },
				{ where: { product_id: product.id }, transaction }
			);
		}
	}

	async getProductsList(user: IUserAuth, queryParams?: ProductQueryParams): Promise<ResponseAbstractList<Product>> {
		const { sellerId, roleCode } = user;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = ProductQueryParams.SearchFilterByQueryParams(sellerId, queryParams, isSpecialAdmin);
		const includeJoiner = ProductQueryParams.includeJoinerByQueryParams(queryParams);
		const attributesIncludeOptions = this.getProductsListIncludeOptions(queryParams);
		const { rows, count } = await this.ProductModel.findAndCountAll({
			attributes: {
				include: attributesIncludeOptions
			},
			where: whereClause,
			include: includeJoiner,
			order: [
				['updatedAt', 'DESC'],
				['id', 'ASC']
			],
			logging: true,
			distinct: true,
			offset,
			limit
		});

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	getProductsListIncludeOptions(queryParams: ProductQueryParams): any[] {
		let attributes = [
			[
				Sequelize.literal(
					`(SELECT IFNULL(SUM(qty) + 0E0, 0)  FROM product_inventory WHERE Product.id = product_inventory.product_id)`
				),
				'stock_quantity'
			],
			[Sequelize.literal(`(SELECT unit FROM units WHERE Product.unit_id = units.id)`), 'unit_name']
		];

		if (queryParams.warehouse_id) {
			attributes = [
				[
					Sequelize.literal(
						`(SELECT IFNULL(SUM(qty) + 0E0, 0) FROM product_inventory WHERE product_inventory.warehouse_id IN (${queryParams.warehouse_id}) AND Product.id =  product_inventory.product_id)`
					),
					'stock_quantity'
				]
			];
		}

		return attributes;
	}

	async updateProduct(user: IUserAuth, productId: number, data: UpdateProductDTO): Promise<void> {
		const transaction = await sequelize.transaction();
		try {
			const { userId, sellerId, roleCode } = user;
			const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
			const currentProduct = await this.ProductModel.findOne({
				where: {
					id: productId,
					seller_id: isSpecialAdmin ? null : sellerId
				},
				raw: true
			});

			if (!currentProduct) {
				throw new HttpException(messages.product.productNotFound, HttpStatus.NOT_FOUND);
			}

			const payload = filterData<UpdateProductDTO>(data);

			if (checkOnlyUpdateStatus(payload)) {
				await this.ProductModel.update(payload as any, {
					where: { id: productId }
				});
				await transaction.commit();
				return;
			}

			if (payload.parent_id && payload.product_variations) {
				throw new HttpException(messages.product.productChildrenShouldNotVariation, HttpStatus.BAD_REQUEST);
			}

			await this.checkUpdateProductValidation(sellerId, productId, payload, isSpecialAdmin);

			if (payload.parent_id) {
				await this.checkCurrentAndParentProductValidationAndUpdate(productId, payload.parent_id, transaction);
			}

			const currentCategoriesList = currentProduct.categories_list
				? mapCategoriesListStringIntoArray(currentProduct.categories_list)
				: currentProduct.categories_list;

			if (
				_.difference(data.categories_list, currentCategoriesList).length ||
				[...new Set(data.categories_list)].length !== [...new Set(currentCategoriesList)].length
			) {
				payload['root_category_url'] = await this.categoryService.findRootCategorySlugFromListCategories(
					sellerId,
					data.categories_list
				);
				await this.ProductCategoryModel.destroy({
					where: { product_id: productId },
					transaction
				});

				const newProductCategories = data.categories_list.map((categoryId) => ({
					product_id: productId,
					category_id: categoryId,
					index: productId
				}));

				await this.ProductCategoryModel.bulkCreate(newProductCategories, { transaction });
			}

			payload['categories_list'] = mapCategoriesListArrayIntoString(payload.categories_list);
			payload['attribute_ids_list'] = this.genAttributesStringList(payload.attributes);

			await this.ProductModel.update(
				{ ...payload, updated_by: userId },
				{
					where: { id: productId },
					transaction
				}
			);

			if (payload?.attributes?.length) {
				await this.ProductAttributeModel.destroy({
					where: { product_id: productId },
					transaction
				});

				const attributesList = payload.attributes.map((attributeItem) => ({
					...attributeItem,
					product_id: productId
				}));

				await this.ProductAttributeModel.bulkCreate(attributesList, {
					transaction
				});
			}

			await Promise.all([
				this.pathUrlStorageService.destroysAll(productId, PathUrlObjectTypeEnum.PRODUCT, transaction),
				this.writeDataIntoProductLog(
					productId,
					payload,
					currentProduct,
					ProductLogTypeEnum['Cập nhật sản phẩm'],
					userId,
					transaction
				),
				payload?.product_variations?.length
					? this.checkAndCreateAndUpdateProductVariations(
							sellerId,
							productId,
							payload.product_variations,
							isSpecialAdmin,
							transaction
					  )
					: null
			]);

			if (data?.image_urls?.length) {
				const productImagePayload = {
					object_id: productId,
					object_type: PathUrlObjectTypeEnum.PRODUCT,
					path_urls: data.image_urls.map((imageUrl, index) => ({
						path_url: imageUrl,
						index,
						offset_width: null,
						offset_height: null
					}))
				};
				await this.pathUrlStorageService.createPathUrls(productImagePayload, transaction);
			}

			await transaction.commit();

			const productCountInCategories = await this.categoryService.getUniqueProductCountInCat(
				user,
				data.categories_list
			);

			if (productCountInCategories.length) {
				await this.categoryService.updateProductCountInCategories(productCountInCategories);
			}
		} catch (error) {
			await transaction.rollback();
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	async checkUpdateProductValidation(
		sellerId: number,
		productId: number,
		data: ProductPayload,
		isSpecialAdmin: boolean
	): Promise<void> {
		if (data?.categories_list?.length > 5) {
			throw new HttpException(messages.product.overCategoriesLimitation, HttpStatus.BAD_REQUEST);
		}
		const productUpdatedVariationsConditions = [];
		const createdBarcode = [];
		const createdSku = [];
		const listBarCode = [];
		const listSku = [];
		if (data?.product_variations?.length) {
			data.product_variations.forEach((productItem) => {
				if (productItem.id) {
					if (productItem.sku && productItem.barcode) {
						productUpdatedVariationsConditions.push({
							id: { [Op.ne]: productItem.id },
							sku: productItem.sku,
							barcode: productItem.barcode
						});
						listBarCode.push(productItem.barcode);
						listSku.push(productItem.sku);
					}
				} else {
					if (productItem.barcode) {
						if (listBarCode.includes(productItem.barcode)) {
							throw new HttpException(messages.product.skuOrBarcodeExist, HttpStatus.BAD_REQUEST);
						}
						createdBarcode.push(productItem.barcode);
						listBarCode.push(productItem.barcode);
					}
					if (productItem.sku) {
						if (listSku.includes(productItem.sku)) {
							throw new HttpException(messages.product.skuOrBarcodeExist, HttpStatus.BAD_REQUEST);
						}
						createdSku.push(productItem.sku);
						listSku.push(productItem.sku);
					}
				}
			});
		} else {
			if (data.sku && data.barcode) {
				productUpdatedVariationsConditions.push({
					[Op.or]: [
						{
							id: { [Op.ne]: productId },
							sku: data.sku
						},
						{
							id: { [Op.ne]: productId },
							barcode: data.barcode
						}
					]
				});
			}
		}

		const whereClause: any = {
			[Op.or]: [
				...productUpdatedVariationsConditions,
				{ barcode: { [Op.in]: createdBarcode } },
				{ sku: { [Op.in]: createdSku } }
			]
		};

		if (data.url) {
			whereClause[Op.or].push({
				id: { [Op.ne]: productId },
				url: data.url
			});
		}

		const checkProductsValidation = await this.ProductModel.findOne({
			where: {
				seller_id: isSpecialAdmin ? null : sellerId,
				...whereClause
			},
			logging: true
		});

		if (checkProductsValidation) {
			throw new HttpException(messages.product.skuOrBarcodeExist, HttpStatus.BAD_REQUEST);
		}
	}

	async checkCurrentAndParentProductValidationAndUpdate(
		productId: number,
		parentProductId: number,
		transaction: Transaction
	): Promise<void> {
		const findCurrentProductById = await this.ProductModel.findByPk(productId);

		switch (findCurrentProductById.product_level) {
			case ProductLevelEnum.Configure: {
				throw new HttpException(messages.product.productParentShouldNotAsVariation, HttpStatus.BAD_REQUEST);
			}
			default: {
				await this.ProductModel.update(
					{
						product_level: ProductLevelEnum.Variation,
						parent_id: parentProductId
					},
					{ where: { id: productId }, transaction }
				);
			}
		}

		const findParentProductById = await this.ProductModel.findByPk(parentProductId);
		if (!findParentProductById) {
			throw new HttpException(messages.product.parentProductNotFound, HttpStatus.NOT_FOUND);
		}

		if (findParentProductById.product_level === ProductLevelEnum.Independence) {
			await this.ProductModel.update(
				{ product_level: ProductLevelEnum.Configure },
				{ where: { id: parentProductId }, transaction }
			);
		}
	}

	async checkAndCreateAndUpdateProductVariations(
		sellerId: number,
		productId: number,
		variations: ProductVariation[],
		isSpecialAdmin: boolean,
		transaction: Transaction
	): Promise<void> {
		const findCurrentProductById = await this.ProductModel.findByPk(productId);

		switch (findCurrentProductById.product_level) {
			case ProductLevelEnum.Variation:
				throw new HttpException(messages.product.productChildrenShouldNotVariation, HttpStatus.BAD_REQUEST);
			case ProductLevelEnum.Independence: {
				await this.ProductModel.update(
					{ product_level: ProductLevelEnum.Configure },
					{ where: { id: productId }, transaction }
				);
			}
		}

		const updatedProductVariationsCollection = variations.filter((variation) => variation.id);
		const newProductVariationsCollection = variations.filter((variation) => !variation.id);

		const updatedProductVariationsPromise = updatedProductVariationsCollection.map(async (productVariation) => {
			const productPayload = {
				...productVariation,
				product_level: ProductLevelEnum.Variation,
				parent_id: productId
			};
			await this.ProductModel.update(productPayload as any, {
				where: { id: productVariation.id },
				transaction
			});

			if (productPayload?.attributes?.length) {
				await this.ProductAttributeModel.destroy({
					where: { product_id: productVariation.id },
					transaction
				});
				const newAttributesList = productPayload.attributes.map((attributeItem) => {
					return {
						...attributeItem,
						product_id: productVariation.id
					};
				});
				await this.ProductAttributeModel.bulkCreate(newAttributesList, { transaction });
			}
		});

		const createdProductVariationsPayload: any = [];
		newProductVariationsCollection.forEach(async (productVariation) => {
			const productPayload = {
				...productVariation,
				product_level: ProductLevelEnum.Variation,
				parent_id: productId,
				seller_id: isSpecialAdmin ? null : sellerId
			};
			createdProductVariationsPayload.push(productPayload);
		});

		await Promise.all([
			...updatedProductVariationsPromise,
			this.ProductModel.bulkCreate(createdProductVariationsPayload, {
				include: [{ association: 'attributes' }],
				transaction
			})
		]);
	}

	async getById(productId: number, user: IUserAuth): Promise<Product> {
		try {
			const { sellerId, roleCode } = user;
			const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
			const [productRespones, imageUrls] = await Promise.all([
				this.ProductModel.findOne({
					attributes: {
						include: [
							[
								Sequelize.literal(
									`(SELECT IFNULL(SUM(qty) + 0E0, 0) FROM product_inventory WHERE Product.id = product_inventory.product_id)`
								),
								'stock_quantity'
							],
							[
								Sequelize.literal(`(SELECT unit FROM units WHERE Product.unit_id = units.id)`),
								'unit_name'
							]
						]
					},
					where: {
						id: productId,
						seller_id: isSpecialAdmin ? null : sellerId
					},
					include: [
						{
							model: ProductAttribute,
							include: [{ model: Attribute, include: [AttributeValue] }]
						},
						Category
					],
					logging: true
				}),
				this.pathUrlStorageService.getPathUrls(productId, PathUrlObjectTypeEnum.PRODUCT)
			]);

			if (!productRespones) {
				throw new HttpException(messages.product.productNotFound, HttpStatus.NOT_FOUND);
			}

			const currentProduct = parseDataSqlizeResponse(productRespones);

			currentProduct.image_urls = imageUrls;

			switch (currentProduct.product_level) {
				case ProductLevelEnum.Configure:
					{
						const productsVariations = await this.getProductsVariations(currentProduct.id);

						if (productsVariations.length) {
							currentProduct['variationAttributesList'] = this.getGroupAttributesList(productsVariations);
						}

						currentProduct['product_variations'] = productsVariations;
					}
					break;
				case ProductLevelEnum.Variation:
					{
						const [productConfig, variationAttrbiutes] = await Promise.all([
							this.getProductConfig(currentProduct.parent_id),
							this.getProductVariationAttribute(productId)
						]);
						currentProduct['product_config'] = productConfig;
						currentProduct['variation_attributes'] = variationAttrbiutes;
					}
					break;
			}

			return this.handleProductBeforeResponse(currentProduct);
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.response, error.status);
		}
	}

	async getProductVariationAttribute(productId: number): Promise<any> {
		const productVariationAttributes = await this.ProductVariationAttributeModel.findAll({
			attributes: {
				include: [
					[
						Sequelize.literal(
							`(SELECT value_name FROM attribute_values WHERE value_id = attribute_values.id)`
						),
						'value_name'
					],
					[
						Sequelize.literal(
							`(SELECT value_code FROM attribute_values WHERE value_id = attribute_values.id)`
						),
						'value_code'
					],
					[
						Sequelize.literal(
							`(SELECT attribute_values.attribute_id FROM attribute_values WHERE value_id = attribute_values.id)`
						),
						'attribute_id'
					],
					[
						Sequelize.literal(
							`(SELECT attributes.attribute_name FROM attribute_values INNER JOIN attributes ON attribute_values.attribute_id = attributes.id WHERE value_id = attribute_values.id )`
						),
						'attribute_name'
					]
				]
			},
			where: { product_id: productId },
			logging: true
		});

		return productVariationAttributes;
	}

	getGroupAttributesList(productsVariations: Product[]) {
		return _.chain(
			parseDataSqlizeResponse(productsVariations)
				.map((item) => item.attributes)
				.flat()
		)
			.groupBy('attribute_id')
			.map((value, key) => ({
				attribute_id: key,
				values:
					value && value.length
						? value.map((item) => ({
								id: item.id,
								attribute_id: item.attribute_id,
								product_id: item.product_id,
								attribute_code: item.attribute.attribute_code,
								attribute_name: item.attribute.attribute_name,
								value: item?.value?.value,
								value_name: item?.value?.value_name,
								value_code: item?.value?.value_code
						  }))
						: value
			}))
			.value();
	}
	async handleProductBeforeResponse(product): Promise<any> {
		let categoriesList: Category[] = [];
		let attributes: any[] = [];
		console.log(product);
		if (product.categories_list) {
			categoriesList = await this.categoryService.getListCategoriesInProductEdit(
				mapCategoriesListStringIntoArray(product.categories_list)
			);
		}

		if (product?.attributes?.length) {
			attributes = product.attributes.map((attributeItem) => ({
				...attributeItem,
				attribute_name: attributeItem?.attribute?.attribute_name,
				attribute_code: attributeItem?.attribute?.attribute_code,
				values: attributeItem?.attribute?.values,
				status: attributeItem?.attribute?.status
			}));
		}

		return {
			...product,
			categories_list: categoriesList,
			attributes
		};
	}

	async getProductsVariations(parentId: number): Promise<Product[]> {
		const productVariations = await this.ProductModel.findAll({
			where: { parent_id: parentId },
			include: [
				{
					model: ProductAttribute,
					include: [
						{
							model: Attribute,
							attributes: ['attribute_name', 'attribute_code'],

							include: [
								{
									model: AttributeValue,
									attributes: ['value', 'value_name', 'value_code']
								}
							]
						}
					]
				}
			]
		});

		return productVariations;
	}

	async getProductConfig(productId: number): Promise<Product> {
		const productConfig = await this.ProductModel.findByPk(productId);

		return productConfig;
	}

	async updateProductCategoriesList(
		productId: number,
		categoryIds: number[],
		transaction: Transaction
	): Promise<void> {
		const currentProduct = await this.ProductModel.findByPk(productId, {
			raw: true
		});

		if (!currentProduct) {
			throw new HttpException(messages.product.productNotFound, HttpStatus.NOT_FOUND);
		}

		const currentProductFormatCategoriesList = await this.handleProductBeforeResponse(currentProduct);

		const updateCategoriesList = [
			...new Set([...currentProductFormatCategoriesList.categories_list, ...categoryIds])
		];

		await this.ProductModel.update(
			{
				categories_list: mapCategoriesListArrayIntoString(updateCategoriesList)
			},
			{ where: { id: productId }, transaction }
		);
	}

	async removeCategoryInCategoriesListProduct(categoryId: number, productId: number, transaction: Transaction) {
		const currentProduct = await this.ProductModel.findByPk(productId, {
			raw: true
		});
		if (!currentProduct) {
			throw new HttpException(messages.product.productNotFound, HttpStatus.NOT_FOUND);
		}

		const categoriesList = currentProduct.categories_list
			? mapCategoriesListStringIntoArray(currentProduct.categories_list)
			: null;

		if (categoriesList) {
			const filteredCategoriesList = categoriesList.filter((_categoryId) => _categoryId !== categoryId).join(',');

			await this.ProductModel.update(
				{ categories_list: filteredCategoriesList },
				{ where: { id: productId }, transaction }
			);
		}
	}

	async writeDataIntoProductLog(
		productId: number,
		inputData: any,
		oldData: any,
		logType: ProductLogTypeEnum,
		handledBy: number,
		transaction: Transaction
	): Promise<void> {
		const outputObjectData = Object.entries(inputData).reduce((acc: any, [fieldName, fieldValue]: any) => {
			const moduleId = ProductsLogsFieldsList[fieldName];
			if (!moduleId) {
				return acc;
			}

			const moduleName = getKeyByValue(ProductTabEnum, moduleId);

			const newDataDetail = fieldValue;
			const oldDataDetail = oldData ? oldData[fieldName] : null;

			if (!acc[moduleName]) {
				acc[moduleName] = {
					product_id: productId,
					module_id: moduleId,
					module_name: moduleName,
					handled_by: handledBy,
					log_type_id: logType,
					log_type_name: getKeyByValue(ProductLogTypeEnum, logType),
					details: [
						{
							field_name: fieldName,
							old_data_value: oldDataDetail,
							new_data_value: newDataDetail
						}
					]
				};
			} else {
				acc[moduleName].details.push({
					field_name: fieldName,
					old_data_value: oldDataDetail,
					new_data_value: newDataDetail
				});
			}

			if (logType === ProductLogTypeEnum['Tạo sản phẩm']) {
				acc[moduleName].details = acc[moduleName].details.filter((item) => item.new_data_value);
				if (!acc[moduleName].details?.length) {
					delete acc[moduleName];
				}
			}
			return acc;
		}, {});

		await this.ProductLogModel.bulkCreate(Object.values(outputObjectData), {
			include: [{ model: ProductLogDetail, as: 'details' }],
			transaction
		});
	}

	async getLogsById(productId, queryParams: ProductLogQueryParamsDto): Promise<ResponseAbstractList<ProductLog>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = this.getProductLogQueryParamWhereClause(productId, queryParams);
		const { rows, count } = await this.ProductLogModel.findAndCountAll({
			attributes: {
				include: [
					[Sequelize.literal(`(SELECT fullname FROM users WHERE id = ProductLog.handled_by)`), 'handled_name']
				]
			},
			where: whereClause,
			include: [ProductLogDetail],
			order: [['updated_at', 'desc']],
			offset,
			limit,
			distinct: true
		});
		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	getProductLogQueryParamWhereClause(productId: number, queryParams: ProductLogQueryParamsDto): any {
		const { module_id, log_type_id, from_date, to_date } = queryParams;
		return [{ product_id: productId }, { module_id }, { log_type_id }, { from_date, to_date }]
			.filter((item) => !isEmptyObject(item))
			.map((_whereClause, ele) => {
				Object.entries(ele).map(([key, val]) => {
					switch (key) {
						case 'from_date':
						case 'to_date': {
							_whereClause['created_at'] = {
								[Op.between]: [from_date, to_date]
							};
						}
						default: {
							_whereClause[key] = val;
						}
					}
				});
				return _whereClause;
			}, {});
	}

	async insertWarehouseIdIntoWarehousesList(warehouseId: number, productIds: number[]) {
		await Promise.all(
			productIds.map(async (productId) => {
				await sequelize.query(
					`
				UPDATE products 
				SET products.warehouse_ids_list = CONCAT_WS(",", products.warehouse_ids_list, "${filterSeperator}${warehouseId}${filterSeperator}") 
				WHERE products.id = ${productId} AND products.warehouse_ids_list NOT REGEXP '${filterSeperator}${warehouseId}${filterSeperator}' OR (products.warehouse_ids_list IS NULL AND id = ${productId}) 
				`
				);
			})
		);
	}

	async changeProductInventory(
		productId: number,
		quantity: number,
		transaction: Transaction,
		warehouseId: number,
		operator: ProductInventoryOperatorEnum = ProductInventoryOperatorEnum.Substract,
		receiveAtStore = false
	): Promise<void> {
		const quantityWithSign =
			operator === ProductInventoryOperatorEnum.Add ? Math.abs(quantity) : -Math.abs(quantity);
		if (!warehouseId) {
			await this.ProductModel.increment(
				{ virtual_stock_quantity: quantityWithSign },
				{
					where: { id: productId },
					transaction,
					logging: true
				}
			);
			return;
		}

		const productInventory = await this.ProductInventoryModel.findOne({
			where: { product_id: productId, warehouse_id: warehouseId }
		});
		if (!productInventory) throw new HttpException(messages.product.productInventoryNotFound, HttpStatus.NOT_FOUND);

		if (quantity > productInventory.qty)
			throw new HttpException(messages.product.overStockQuantity, HttpStatus.BAD_REQUEST);

		await Promise.all([
			this.ProductModel.increment(
				{ virtual_stock_quantity: quantityWithSign },
				{ where: { id: productId }, transaction }
			),
			receiveAtStore
				? this.decrementProductQuantityInventory(productId, warehouseId, quantity, transaction)
				: null
		]);
	}

	async decrementProductQuantityInventory(
		productId: number,
		warehouseId: number,
		quantity: number,
		transaction: Transaction
	): Promise<void> {
		await this.ProductInventoryModel.decrement(
			{ qty: Math.abs(quantity) },
			{ where: { product_id: productId, warehouse_id: warehouseId }, transaction }
		);
	}

	async findAllProductsByCategoryIds(categoryIds: number[]): Promise<ProductCategory[]> {
		return await this.ProductCategoryModel.findAll({ where: { category_id: { [Op.in]: categoryIds } } });
	}

	async findAllProductsForPromotion({ sellerId, roleCode }: IUserAuth, minPrice: number): Promise<number[]> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		return (
			await this.ProductModel.findAll({
				where: {
					seller_id: isSpecialAdmin ? null : sellerId,
					retail_price: {
						[Op.gte]: minPrice
					}
				}
			})
		).map(({ id }) => id);
	}

	async checkProductForPromotionValidation(productIds: number[], minPrice = 0) {
		const productsResponse = await this.ProductModel.findAll({
			where: { id: { [Op.in]: productIds }, retail_price: { [Op.gte]: minPrice } }
		});

		if (productIds.length !== productsResponse.length)
			throw new HttpException(messages.promotionProgram.invalidProductPrice, HttpStatus.BAD_REQUEST);
	}

	async decrementProductInventory(product_id: number, warehouse_id: number, amount: number): Promise<void> {
		await this.ProductInventoryModel.update(
			{
				qty: Sequelize.literal(`qty - ${Math.abs(amount)}`)
			},
			{ where: { product_id, warehouse_id } }
		);
	}
	async incrementProductInventory(product_id: number, warehouse_id: number, amount: number): Promise<void> {
		await this.ProductInventoryModel.update(
			{
				qty: Sequelize.literal(`qty + ${Math.abs(amount)}`)
			},
			{ where: { product_id, warehouse_id } }
		);
	}

	async incrementVirtualStockQuantity(product_id: number, amount: number): Promise<void> {
		await this.ProductModel.update(
			{
				qty: Sequelize.literal(`qty + ${Math.abs(amount)}`)
			},
			{ where: { id: product_id } }
		);
	}

	async findProductByBulkCategoryIds(categoryIds: number[]): Promise<ProductCategory[]> {
		return await this.ProductCategoryModel.findAll({
			where: { category_id: { [Op.in]: categoryIds } }
		});
	}

	async findAllByProductIds(productIds: number[]): Promise<Product[]> {
		return await this.ProductModel.findAll({
			where: { id: { [Op.in]: productIds } }
		});
	}

	async findAllProducts({ roleCode, sellerId }: IUserAuth): Promise<Product[]> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		return await this.ProductModel.findAll({ where: { seller_id: isSpecialAdmin ? null : sellerId } });
	}

	async importProducts(user: IUserAuth, productsList: ImportProductDto[]): Promise<any> {
		await this.checkImportProductValidation(user, productsList);
		await this.createProductsImport(user, productsList);
	}

	async checkImportProductValidation({ roleCode, sellerId }: IUserAuth, data: ImportProductDto[]) {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const { skus, urls, barcodes } = data.reduce(
			(acc, ele) => {
				if (!ele.url) throw new HttpException(messages.product.urlShouldNotEmpty, HttpStatus.BAD_REQUEST);
				if (!ele.sku) throw new HttpException(messages.product.skuShouldNotEmpty, HttpStatus.BAD_REQUEST);
				if (!ele.barcode)
					throw new HttpException(messages.product.barcodeShouldNotEmpty, HttpStatus.BAD_REQUEST);

				acc.urls.push(ele.url);
				acc.skus.push(ele.sku);
				acc.barcodes.push(ele.barcode);
				return acc;
			},
			{ skus: [], urls: [], barcodes: [] }
		);

		const whereClause = {
			seller_id: isSpecialAdmin ? null : sellerId,
			sku: {
				[Op.in]: skus
			},
			barcode: {
				[Op.in]: barcodes
			},
			url: {
				[Op.in]: urls
			}
		};

		const productExist = await this.ProductModel.findOne({ where: whereClause });
		if (productExist) {
			throw new HttpException(messages.product.skuOrBarcodeExist, HttpStatus.BAD_REQUEST);
		}
	}

	async createProductsImport(
		{ sellerId, userId, roleCode }: IUserAuth,
		productsList: ImportProductDto[]
	): Promise<void> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const productsPayload = productsList.map((productItem) => {
			const categoryId = getIdByDynamicDataList(productItem.category_name);
			const catalogId = getIdByDynamicDataList(productItem.catalog_name);
			return {
				...productItem,
				seller_id: isSpecialAdmin ? null : sellerId,
				product_type: getKeyByValue(ProductTypeEnum, productItem.product_type),
				status: productItem.status === 'Hoạt động' ? true : false,
				product_status: getKeyByValue(ProductStatusEnum, productItem.product_status),
				canonical: productItem?.canonical ? productItem?.canonical['text'] ?? productItem.canonical : null,
				categories_list: categoryId ? mapCategoriesListArrayIntoString([categoryId]) : null,
				catalog_id: catalogId,
				created_by: userId,
				updated_by: userId
			};
		});
		console.log(productsPayload);
		await this.ProductModel.bulkCreate(productsPayload);
	}

	async getByListIds(ids: number[]): Promise<Product[]> {
		return await this.ProductModel.findAll({ include: [Category, Catalog], where: { id: { [Op.in]: ids } } });
	}
}
