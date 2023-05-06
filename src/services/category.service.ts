import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { filterSeperator } from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { sequelize } from 'src/configs/db';
import { CreateCategoryDto } from 'src/dtos/requests/category/createCategory.dto';
import { CategoryQueryParamsDto } from 'src/dtos/requests/category/queryParams.dto';
import { UpdateCategoryDto } from 'src/dtos/requests/category/updateCategory.dto';
import { UpdateCategoryAttributeIndexDto } from 'src/dtos/requests/category/updateCategoryAttributeIndex.dto';
import { UpdateCategoryIndexDto } from 'src/dtos/requests/category/updateCategoryIndex';
import {
	UpdatedProductCategory,
	UpdateProductInCategoryDto
} from 'src/dtos/requests/category/updateProductInCategory.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { ICreateProductCategoryData, IUpdateProductCountInCategory } from 'src/interfaces/category.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Attribute } from 'src/models/attribute.model';
import { AttributeValue } from 'src/models/attributeValue.model';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { Category } from 'src/models/category.model';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import { ProductCategory } from 'src/models/productCategory.model';
import { checkSlugValidation, filterData, getPageOffsetLimit } from 'src/utils/functions.utils';
import { Product } from '../models/product.model';
import { parseDataSqlizeResponse } from '../utils/functions.utils';
import { ProductService } from './product.service';

@Injectable()
export class CategoryService {
	constructor(
		@InjectModel(Category)
		private readonly CategoryModel: typeof Category,
		@InjectModel(CategoryAttribute)
		private readonly CategoryAttributeModel: typeof CategoryAttribute,
		@InjectModel(ProductCategory)
		private readonly ProductCategoryModel: typeof ProductCategory,
		@Inject(forwardRef(() => ProductService))
		private readonly productService: ProductService,
		@InjectModel(CatalogCategory)
		private readonly CatalogCategoryModel: typeof CatalogCategory
	) {}

	async getCategoryList(
		queryParams: CategoryQueryParamsDto,
		{ sellerId, roleCode }: IUserAuth
	): Promise<ResponseAbstractList<Category>> {
		const { q, status, catalog_id } = queryParams;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const resultQuery = await this.getCategoryListFromRawString(queryParams, sellerId, isSpecialAdmin);
		const nestCategories = this.nestCategories(resultQuery, catalog_id);
		return {
			paging: {
				currentPage: 1,
				pageSize: nestCategories.length,
				total: nestCategories.length
			},
			data: catalog_id
				? nestCategories.sort((a: any, b: any) => a['category_index'] - b['category_index'])
				: nestCategories.sort(
						(a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
				  )
		};
	}

	async getCategoryListFromRawString(
		queryParams: CategoryQueryParamsDto,
		sellerId: number,
		isSpecialAdmin: boolean
	): Promise<Category[]> {
		const { q, status, catalog_id } = queryParams;
		const selectString = this.getCategoriesSELECTString(catalog_id);
		const fromString = this.getCategoriesFROMString(catalog_id);
		const sellerIdWhereClause = this.getCategoriesListForSellerIdWhereClause(sellerId, catalog_id, isSpecialAdmin);
		const catsCategoryNameAlias = this.getCategoriesListNameAlias();
		const searchWhereClause = this.getCategoriesListSearch(q, catsCategoryNameAlias);
		const statusWhereClause = this.getCategoriesListStatusFilter(catalog_id, status);
		const catalogWhereClause = this.getCategoriesListCatalogWhereClause(catalog_id);
		const groupByClause = this.getCategoriesListCatalogGroupByClause(selectString);
		const queryString = [
			'SELECT',
			selectString,
			'FROM',
			fromString,
			'WHERE',
			[sellerIdWhereClause, searchWhereClause, statusWhereClause, catalogWhereClause]
				.filter(Boolean)
				.map((i) => `(${i})`)
				.join(' AND '),
			'GROUP BY',
			groupByClause,
			'ORDER BY cat0.level DESC'
		].join(' ');

		const [resultQuery] = await sequelize.query(queryString, { logging: true });
		return resultQuery as Category[];
	}

	nestCategories(categoriesList: any, catalog_id?: number) {
		return (categoriesList as Category[])
			.reduce((res, item: any) => {
				const childrenCats = res
					.filter((resItem) =>
						catalog_id ? resItem.parent_id === item.category_id : resItem.parent_id === item.id
					)
					.map((resItem) => ({ ...resItem, status: !!resItem.status }));

				if (childrenCats.length) {
					item['children'] = _.orderBy(childrenCats, ['category_index'], ['asc']);
					childrenCats.forEach((childCat: any) => {
						const resIndex = res.findIndex((resItem: any) =>
							catalog_id ? resItem.category_id === childCat.category_id : resItem.id === childCat.id
						);
						res.splice(resIndex, 1);
					});
				}
				item.status = !!item.status;
				res.push(item);
				return res;
			}, [] as Category[])
			.filter((catItem) => catItem.level === 0);
	}

	getCategoriesListStatusFilter(catalog_id: number, status: number): string {
		if (![0, 1].includes(status)) {
			return undefined;
		}
		return catalog_id ? `catalog_categories.status = ${status}` : `cat0.status = ${status}`;
	}

	getCategoriesListCatalogWhereClause(catalog_id: number) {
		return catalog_id ? `catalog_categories.catalog_id = ${catalog_id}` : undefined;
	}

	getCategoriesListSearch(q: string, catsCategoryNameAlias: string[]) {
		return q ? catsCategoryNameAlias.map((als) => `${als} LIKE '%${q}%'`).join(' OR ') : undefined;
	}

	getCategoriesSELECTString(catalog_id: number) {
		const selectString = [
			catalog_id ? `catalog_categories.id AS id` : `cat0.id AS id`,
			catalog_id ? `catalog_categories.category_id AS category_id` : `cat0.id AS category_id`,
			`cat0.parent_id`,
			`cat0.category_name`,
			catalog_id ? `catalog_categories.status` : `cat0.status`,
			`cat0.url`,
			`cat0.root_id`,
			`cat0.root_parent_id`,
			`cat0.description`,
			`cat0.level`,
			`cat0.id_path`,
			`cat0.category_image`,
			`cat0.url`,
			`cat0.redirect_url`,
			`cat0.redirect_type`,
			`cat0.product_count`,
			`cat0.created_at`,
			`cat0.updated_at`
		];

		if (catalog_id) {
			selectString.unshift([`catalog_categories.catalog_id`, `catalog_categories.category_index`].join(', '));
		}
		return selectString.join(', ');
	}

	getCategoriesListCatalogGroupByClause(selectString: string) {
		return selectString
			.split(',')
			.map((item) => item.split('AS').slice(0).toString())
			.join(', ');
	}

	getCategoriesFROMString(catalog_id: number) {
		return catalog_id
			? `
		catalog_categories 
		INNER JOIN categories AS cat0 
		  ON catalog_categories.category_id = cat0.id 
		LEFT JOIN categories cat1 
		  ON cat0.id = cat1.parent_id 
		LEFT JOIN categories cat2 
		  ON cat1.id = cat2.parent_id 
		LEFT JOIN categories cat3 
		  ON cat2.id = cat3.parent_id 
		LEFT JOIN categories cat4 
		  ON cat3.id = cat4.parent_id
		`
			: `categories AS cat0  
		 LEFT JOIN categories cat1 
		ON cat0.id = cat1.parent_id 
	  LEFT JOIN categories cat2 
		ON cat1.id = cat2.parent_id 
	  LEFT JOIN categories cat3 
		ON cat2.id = cat3.parent_id 
	  LEFT JOIN categories cat4 
		ON cat3.id = cat4.parent_id
	  `;
	}

	getCategoriesListForSellerIdWhereClause(sellerId: number, catalog_id: number, isSpecialAdmin: boolean) {
		if (isSpecialAdmin) {
			if (catalog_id) {
				return `catalog_categories.seller_id IS NULL`;
			}
			return `cat0.seller_id IS NULL`;
		}
		if (catalog_id) {
			return `catalog_categories.seller_id = ${sellerId}`;
		}
		return `cat0.seller_id = ${sellerId}`;
	}

	getCategoriesListNameAlias() {
		return [
			'cat0.category_name',
			'cat1.category_name',
			'cat2.category_name',
			'cat3.category_name',
			'cat4.category_name'
		];
	}

	async createCategory(data: CreateCategoryDto, sellerId: number, isSpecialAdmin = false): Promise<Category> {
		const payloadData = filterData<Category>(data);

		if (isSpecialAdmin) {
			await this.checkCategoryValidation(payloadData);
			payloadData.is_default = true;
			payloadData.seller_id = null;
		} else {
			await this.checkCategoryValidation(payloadData, sellerId);
			payloadData.is_default = false;
			payloadData.seller_id = sellerId;
		}

		if (payloadData.parent_id) {
			const parentCategory = await this.CategoryModel.findByPk(payloadData.parent_id);
			if (!parentCategory) {
				throw new HttpException(messages.category.notFound, HttpStatus.NOT_FOUND);
			}
			if (parentCategory.level >= 4) {
				throw new HttpException(messages.category.overMaxLevel, HttpStatus.BAD_REQUEST);
			}
			payloadData.id_path = parentCategory.id_path;
			payloadData.level = parentCategory.level + 1;
		}

		const newCategory = await this.CategoryModel.create(payloadData as any, { raw: true });
		newCategory.id_path = `${newCategory.id_path || ''}/${newCategory.id}`.split('/').filter(Boolean).join('/');
		await newCategory.save();
		return newCategory;
	}

	async checkCategoryValidation(payloadData: Category, sellerId?: number) {
		if (payloadData.url) {
			if (!checkSlugValidation(payloadData.url)) {
				throw new HttpException(messages.category.invalidURL, HttpStatus.BAD_REQUEST);
			}

			const whereClause = {
				url: payloadData.url,
				seller_id: sellerId ? { [Op.ne]: sellerId } : null
			};
			const findCategoryByURL = await this.CategoryModel.findOne({
				where: whereClause
			});
			if (findCategoryByURL) {
				throw new HttpException(messages.category.URLhasExist, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async getCategoryById(categoryId: number, sellerId: number, roleCode: string): Promise<Category> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const currentCategory = await this.CategoryModel.findOne({
			attributes: {
				include: [
					[
						Sequelize.literal('`attributes->CategoryAttribute`.`status`'),
						'`attributes.categoryAttributeStatus`'
					]
				]
			},
			where: {
				id: categoryId,
				seller_id: isSpecialAdmin ? null : sellerId
			},
			include: [
				{
					model: Attribute,
					include: [AttributeValue]
				}
			],
			logging: true
		});

		if (!currentCategory) {
			throw new HttpException(messages.category.notFound, HttpStatus.NOT_FOUND);
		}

		const categoryResponse = currentCategory.toJSON();

		categoryResponse.attributes = categoryResponse.attributes = _.orderBy(
			categoryResponse.attributes.map((attributeItem) => ({
				...attributeItem,
				index: attributeItem?.CategoryAttribute?.index
			})),
			['index'],
			['asc']
		).map((attribute) => ({ ...attribute, status: Boolean(attribute.categoryAttributeStatus) }));

		return categoryResponse;
	}

	async updateCategoryAttributeIndex(data: UpdateCategoryAttributeIndexDto): Promise<void> {
		const { category_attributes } = data;
		await this.CategoryAttributeModel.bulkCreate(category_attributes as any[], {
			updateOnDuplicate: ['index']
		});
	}

	async updateCategory(
		user: IUserAuth,
		categoryId: number,
		data: UpdateCategoryDto,
		transaction: Transaction
	): Promise<void> {
		try {
			const { sellerId } = user;
			const currentCategory = await this.CategoryModel.findByPk(categoryId);
			if (!currentCategory) {
				throw new HttpException(messages.category.notFound, HttpStatus.NOT_FOUND);
			}

			const payloadData = filterData<Category>(data);

			await this.checkCategoryUpdateValidation(
				sellerId,
				{ ...payloadData, id: categoryId } as Category,
				categoryId
			);

			if (payloadData?.parent_id && payloadData.parent_id !== currentCategory.parent_id) {
				const parentCategory = await this.CategoryModel.findByPk(payloadData.parent_id);
				if (!parentCategory) {
					throw new HttpException(messages.category.notFound, HttpStatus.NOT_FOUND);
				}

				if (parentCategory.level >= 4) {
					throw new HttpException(messages.category.overMaxLevel, HttpStatus.BAD_REQUEST);
				}

				const oldIdPath = currentCategory.id_path;
				const newIdPath = `${parentCategory.id_path}/${categoryId}`.split('/').filter(Boolean).join('/');

				payloadData.id_path = newIdPath;
				payloadData.level = parentCategory.level + 1;

				await this.updateCategoryIdPath(oldIdPath, newIdPath, transaction);
			}

			await this.CategoryModel.update(payloadData as any, {
				where: { id: categoryId },
				transaction
			});

			if (data?.attributes?.length) {
				await this.CategoryAttributeModel.bulkCreate(data.attributes as any, {
					updateOnDuplicate: ['status'],
					transaction,
					logging: true
				});
			}
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	async updateProductInCategory(
		user: IUserAuth,
		categoryId: number,
		data: UpdateProductInCategoryDto
	): Promise<void> {
		const transaction = await sequelize.transaction();
		try {
			if (data.new_products.length) {
				await Promise.all([this.createProductCategory(categoryId, data.new_products, transaction)]);
			}

			if (data.updated_products.length) {
				await this.updateProductIndexInCategory(categoryId, data.updated_products, transaction);
			}

			if (data.removed_products.length) {
				await Promise.all([
					...data.removed_products.map(async (productId) => {
						await this.productService.removeCategoryInCategoriesListProduct(
							categoryId,
							productId,
							transaction
						);
					}),
					this.ProductCategoryModel.destroy({
						where: {
							category_id: categoryId,
							product_id: data.removed_products
						},
						transaction
					})
				]);
			}
			await transaction.commit();
			if (data.removed_products.length || data.new_products.length) {
				const productCountInCategories = await this.getUniqueProductCountInCat(user, [categoryId]);

				if (productCountInCategories.length) {
					await this.updateProductCountInCategories(productCountInCategories);
				}
			}
		} catch (error) {
			console.log(error.stack);
			await transaction.rollback();
			throw new HttpException(error.message, error.status);
		}
	}

	async updateProductIndexInCategory(
		categoryId: number,
		productsList: UpdatedProductCategory[],
		transaction: Transaction
	): Promise<void> {
		const updatedProductsSortedDESC = _.orderBy(productsList, ['index'], ['asc']);

		if (productsList.length === 1) {
			const lastProductCategoryIndex = updatedProductsSortedDESC.at(-1).index;
			await sequelize.query(
				`UPDATE product_categories SET product_categories.index = product_categories.index + 1 WHERE product_categories.index >= ${lastProductCategoryIndex} AND category_id = ${categoryId}`,
				{ transaction }
			);
		}

		const updateProductCategoryData = updatedProductsSortedDESC.map(({ product_id, index }, i) => ({
			category_id: categoryId,
			product_id,
			index
		}));

		await this.ProductCategoryModel.bulkCreate(updateProductCategoryData, {
			updateOnDuplicate: ['index'],
			transaction
		});
	}

	async createProductCategory(categoryId: number, productIds: number[], transaction: Transaction): Promise<void> {
		const productCategories = productIds.map((productId: number, i: number) => ({
			product_id: productId,
			category_id: categoryId,
			index: i + 1
		}));

		await Promise.all([
			this.createBulkProductsCategory(categoryId, productCategories, transaction),
			...productIds.map(async (productId) => {
				await this.productService.updateProductCategoriesList(productId, [categoryId], transaction);
			})
		]);
	}

	async createBulkProductsCategory(
		categoryId: number,
		bulkData: ICreateProductCategoryData[],
		transaction: Transaction
	) {
		const lastProductCategory = await this.ProductCategoryModel.findOne({
			where: { category_id: categoryId },
			order: [['index', 'DESC']],
			raw: true
		});

		const lastIndex = lastProductCategory ? lastProductCategory.index : 0;

		const createBulkData = bulkData.map((dataItem) => ({
			...dataItem,
			index: dataItem.index + lastIndex
		}));

		await this.ProductCategoryModel.bulkCreate(createBulkData, {
			transaction,
			ignoreDuplicates: true
		});
	}

	async checkCategoryUpdateValidation(sellerId: number, payloadData: Category, categoryId: number) {
		if (payloadData.url) {
			if (!checkSlugValidation(payloadData.url)) {
				throw new HttpException(messages.category.invalidURL, HttpStatus.BAD_REQUEST);
			}

			const findOtherCategoryByURL = await this.CategoryModel.findOne({
				where: {
					id: {
						[Op.ne]: categoryId
					},
					url: payloadData.url,
					seller_id: sellerId
				}
			});
			if (findOtherCategoryByURL) {
				throw new HttpException(messages.category.URLhasExist, HttpStatus.BAD_REQUEST);
			}
		}

		if (payloadData.parent_id) {
			const parentCategory = await this.CategoryModel.findByPk(payloadData.parent_id);
			const currentCategory = await this.CategoryModel.findByPk(payloadData.id);
			if (parentCategory.id_path.split('/').filter(Boolean).includes(String(currentCategory.id))) {
				throw new HttpException(messages.category.invalidParentCat, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async updateCategoryIndex(data: UpdateCategoryIndexDto): Promise<void> {
		await Promise.all(
			data.categories.map(async ({ category_id, catalog_id, category_index }) => {
				await this.CatalogCategoryModel.update(
					{ category_index },
					{ where: { catalog_id, category_id }, logging: true }
				);
			})
		);
	}

	// @Timeout(Date.now().toString(), 500)
	// async ___() {
	// 	const catalogCategoryList = listDataParser<CatalogCategory>(await this.CatalogCategoryModel.findAll());
	// 	const listDuplicates = catalogCategoryList.reduce((acc, item) => {
	// 		const _listDuplicates = catalogCategoryList.filter(
	// 			(_item) =>
	// 				_item.catalog_id === item.catalog_id &&
	// 				_item.category_id === item.category_id &&
	// 				_item.id !== item.id &&
	// 				_item.seller_id == item.seller_id
	// 		);
	// 		return acc.concat(_listDuplicates);
	// 	}, []);
	// 	console.log(listDuplicates);
	// 	await this.CatalogCategoryModel.destroy({ where: { id: listDuplicates.map(({ id }) => id) }, logging: true });
	// }

	async updateCategoryIdPath(oldIdPath: string, newIdPath: string, transaction: Transaction) {
		const diffLevel = newIdPath.split('/').filter(Boolean).length - oldIdPath.split('/').filter(Boolean).length;

		await sequelize.query(
			`
				UPDATE categories 
				SET id_path = REPLACE(id_path,'${oldIdPath}', '${newIdPath}'), level = level + ${diffLevel}
				WHERE id_path LIKE '${oldIdPath}%'
			`,
			{ transaction }
		);
	}

	async findRootCategorySlugFromListCategories(sellerId: number, categoriesListId: number[]): Promise<string> {
		const categoriesList = (
			await this.CategoryModel.findAll({
				where: { id: { [Op.in]: categoriesListId } }
			})
		).reduce((acc, categoryItem) => {
			acc = acc.concat(categoryItem.id_path.split('/').filter(Boolean));
			return acc;
		}, []);
		const rootCategoryId = Number(_.head(_(categoriesList).countBy().entries().maxBy(_.last)));
		const rootCategorySlug = await this.CategoryModel.findByPk(rootCategoryId, { attributes: ['url'] });
		return [rootCategorySlug.url, sellerId].filter(Boolean).join('-');
	}

	async updateProductCountInCategories(inputData: IUpdateProductCountInCategory[]) {
		await this.CategoryModel.bulkCreate(inputData as any, {
			updateOnDuplicate: ['product_count']
		});
	}

	async getProductCountInCategories(
		{ sellerId, roleCode }: IUserAuth,
		inputData: number | string
	): Promise<IUpdateProductCountInCategory[]> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		let idPath = String(inputData);
		if (typeof inputData === 'number') {
			const categoryResponse = await this.CategoryModel.findByPk(inputData, {
				attributes: ['id_path'],
				raw: true
			});
			if (!categoryResponse) {
				throw new HttpException(messages.category.notFound, HttpStatus.NOT_FOUND);
			}
			idPath = categoryResponse.id_path;
		}
		return Promise.all(
			idPath
				.split('/')
				.filter(Boolean)
				.map(async (catId) => {
					const childrenCatsIds = (
						await this.CategoryModel.findAll({
							attributes: ['id'],
							where: {
								id_path: {
									[Op.regexp]: Sequelize.literal(`'${String(catId as string)}'`)
								},
								seller_id: isSpecialAdmin ? null : sellerId
							}
						})
					).map((catItem) => catItem.id);

					const productCount = await this.ProductCategoryModel.count({
						where: {
							category_id: { [Op.in]: childrenCatsIds }
						}
					});
					return {
						id: Number(catId),
						product_count: productCount
					};
				})
		);
	}

	async getUniqueProductCountInCat(
		user: IUserAuth,
		categoriesList: number[]
	): Promise<IUpdateProductCountInCategory[]> {
		return _.chain(
			(
				await Promise.all(
					categoriesList.map(async (categoryId) => {
						return this.getProductCountInCategories(user, Number(categoryId));
					})
				)
			).reduce((acc, ele) => acc.concat(ele), [])
		)
			.uniqBy('id')
			.value();
	}

	async getListCategoriesInProductEdit(categoriesList: number[]): Promise<Category[]> {
		return this.CategoryModel.findAll({
			where: { id: { [Op.in]: categoriesList } }
		});
	}

	async updateCatalogInCategoriesList(catalogId: number, categoryIds: number[]): Promise<void> {
		await Promise.all(
			categoryIds.map(async (categoryId) => {
				await sequelize.query(
					`UPDATE categories 
					SET categories.catalogs_list = CONCAT_WS(",", categories.catalogs_list, "${filterSeperator}${catalogId}${filterSeperator}") 
					WHERE categories.id = ${categoryId} AND categories.catalogs_list NOT REGEXP '${filterSeperator}${catalogId}${filterSeperator}' OR (categories.catalogs_list IS NULL AND id = ${categoryId}) `
				);
			})
		);
	}

	async getCategoriesListByAttributeId(
		attributeId: number,
		queryParams: CategoryQueryParamsDto
	): Promise<ResponseAbstractList<any>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const { q } = queryParams;
		const whereClause = q ? [`WHERE c.category_name = ${q}`] : '';
		const categoriesListQuery = [
			`SELECT * `,
			`FROM category_attributes AS ca INNER JOIN categories AS c ON ca.category_id = c.id AND ca.attribute_id = ${attributeId}`,
			whereClause,
			`LIMIT ${limit}`,
			`OFFSET ${offset}`
		].join(' ');
		const countCategoriesListQuery = [
			`SELECT COUNT(*) as total`,
			`FROM category_attributes AS ca INNER JOIN categories AS c ON ca.category_id = c.id AND ca.attribute_id = ${attributeId}`,
			whereClause
		].join(' ');
		const [response, count]: any = await Promise.all([
			sequelize.query(categoriesListQuery),
			sequelize.query(countCategoriesListQuery)
		]);
		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count[0].total
			},
			data: response[0]
		};
	}

	async createCategoryForSellerByCatalogId(
		catalogId: number,
		sellerId: number,
		transaction: Transaction
	): Promise<void> {
		const catalogCategoriesList = parseDataSqlizeResponse(
			await this.CatalogCategoryModel.findAll({
				where: { catalog_id: catalogId, seller_id: null, status: true },
				include: [Category]
			})
		) as CatalogCategory[];
		const categoriesListPayload = catalogCategoriesList.map((item: CatalogCategory) => {
			const categoryItem = {
				...item.category,
				seller_id: sellerId,
				root_id: item.category.id,
				root_parent_id: item.category.parent_id
			};
			delete categoryItem.id;
			return categoryItem;
		});
		const categoriesListResponse = await this.CategoryModel.bulkCreate(categoriesListPayload as any, {
			transaction
		});
		console.log('================================================	');
		const catalogCategoriesBySellerId = categoriesListResponse.map(({ id, root_id }) => ({
			catalog_id: catalogId,
			category_id: id,
			seller_id: sellerId,
			category_index: catalogCategoriesList.find(({ category_id }) => category_id === root_id).category_index
		}));

		await Promise.all([
			this.CatalogCategoryModel.bulkCreate(catalogCategoriesBySellerId as any, { transaction, logging: true }),
			sequelize.query(
				`
				UPDATE 
					categories AS child INNER JOIN categories AS parent ON child.root_parent_id = parent.root_id
				SET
					child.parent_id = parent.id
				WHERE child.seller_id = ${sellerId} AND parent.seller_id = ${sellerId}
				`,
				{ transaction, logging: true }
			)
		]);
	}

	async findAllProductsByCategoryIdsForPromotion(categoryIds: number[], minPrice = 0): Promise<number[]> {
		return (
			await this.ProductCategoryModel.findAll({
				include: [{ model: Product, where: { retail_price: { [Op.gte]: minPrice } } }],
				where: { category_id: { [Op.in]: categoryIds } },
				attributes: ['product_id']
			})
		).map(({ product_id }) => product_id);
	}

	async findAllProductsByCategoryIdForPromotion(categoryId: number, minPrice = 0): Promise<number[]> {
		return (
			await this.ProductCategoryModel.findAll({
				include: [{ model: Product, where: { retail_price: { [Op.gte]: minPrice } } }],
				where: { category_id: categoryId },
				attributes: ['product_id']
			})
		).map(({ product_id }) => product_id);
	}

	async findAllByCatIds(categoryIds: number[]): Promise<Category[]> {
		return await this.CategoryModel.findAll({ where: { id: { [Op.in]: categoryIds } } });
	}

	async updateCategoryFromRootIdPathForNewSeller(sellerId: number) {
		const categoriesList = await this.getCategoryListFromRawString({}, sellerId, false);
		const idPathsList = this.genNewIdPathsFromRootIdPath(categoriesList);
		if (!idPathsList.length) return;
		await Promise.all(
			idPathsList.map(async (idPath) => {
				const currentCatId = idPath.slice(-1)[0];
				await this.CategoryModel.update({ id_path: idPath.join('/') }, { where: { id: currentCatId } });
			})
		);
	}

	genNewIdPathsFromRootIdPath(categoriesList: Category[]) {
		const idPathsList = categoriesList.map((categoryItem) => {
			const rootIdPathList = categoryItem.id_path.split('/');
			const newIdPathList = rootIdPathList.map(
				(catId) => categoriesList.find(({ root_id }) => root_id === Number(catId)).id
			);
			return newIdPathList;
		});
		return idPathsList;
	}

	async findByCategoryName(catName: string) {
		return await this.CategoryModel.findOne({where: {category_name: catName}})
	}
}
