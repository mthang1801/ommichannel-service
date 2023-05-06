import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import sequelize, { Op, Transaction } from 'sequelize';
import messages from 'src/common/constants/messages';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { CreateCatalogDto } from 'src/dtos/requests/catalog/createCatalog.dto';
import { CatalogQueryParamsDto } from 'src/dtos/requests/catalog/queryParams.dto';
import { UpdateCatalogDto } from 'src/dtos/requests/catalog/updateCatalog.dto';
import { UpdateCatalogIndexDto } from 'src/dtos/requests/catalog/updateCatalogIndex.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { ICatalogCategory } from 'src/interfaces/catalogCategory.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Catalog } from 'src/models/catalog.model';
import { CatalogCategory } from 'src/models/catalogCategory.model';
import { Category } from 'src/models/category.model';
import { SellerCatalog } from 'src/models/sellerCatalog.model';
import { filterData, getPageOffsetLimit, parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { Seller } from '../models/seller.model';
import { CategoryService } from './category.service';

@Injectable()
export class CatalogService {
	constructor(
		@InjectModel(Catalog) private readonly CatalogModel: typeof Catalog,
		@InjectModel(CatalogCategory)
		private readonly CatalogCategoryModel: typeof CatalogCategory,
		@InjectModel(SellerCatalog)
		private readonly SellerCatalogModel: typeof SellerCatalog,
		@InjectModel(Category)
		private readonly CategoryModel: typeof Category,
		@Inject(forwardRef(() => CategoryService))
		private readonly categoryService: CategoryService
	) {}
	async createCatalog(payloadData: CreateCatalogDto, user: IUserAuth): Promise<void> {
		const { roleCode } = user;
		if (!isSpecialAdminByRoleCode(roleCode)) {
			throw new HttpException(messages.res.http.unauth, HttpStatus.UNAUTHORIZED);
		}
		await this.checkCreateCatalogValidation(payloadData);
		const newCatalog = await this.CatalogModel.create(payloadData as any);
		newCatalog.index = newCatalog.id;
		await newCatalog.save();
	}

	async checkCreateCatalogValidation(payloadData: { catalog_name: string }): Promise<void> {
		const checkCatalogExist = await this.CatalogModel.findOne({
			where: sequelize.where(
				sequelize.fn('LOWER', sequelize.col('catalog_name')),
				payloadData.catalog_name.toLowerCase()
			)
		});

		if (checkCatalogExist) {
			throw new HttpException(messages.catalog.hasExist, HttpStatus.BAD_REQUEST);
		}
	}

	async updateCatalog(catalogId: number, data: UpdateCatalogDto, user: IUserAuth): Promise<void> {
		const { roleCode, sellerId } = user;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);

		const payloadData = filterData<UpdateCatalogDto>(data);

		if (payloadData.catalog_name || [true, false].includes(payloadData.status)) {
			if (!isSpecialAdmin) {
				throw new HttpException(messages.catalog.unAuthorized, HttpStatus.UNAUTHORIZED);
			}
			if (payloadData.catalog_name) {
				await this.checkUpdateCatalogValidation(catalogId, payloadData);
			}

			await this.CatalogModel.update(payloadData as any, {
				where: { id: catalogId }
			});
		}

		if (payloadData.category_ids) {
			const categoriesListResponse = [
				...new Set(
					parseDataSqlizeResponse(
						await this.CategoryModel.findAll({
							attributes: ['id_path'],
							where: { id: { [Op.in]: payloadData.category_ids } }
						})
					).reduce((acc, ele) => {
						ele.id_path
							.split('/')
							.filter(Boolean)
							.forEach((item) => acc.push(Number(item)));
						return acc;
					}, [])
				)
			];

			if (categoriesListResponse.length) {
				const currentCategoriesList = parseDataSqlizeResponse(
					await this.CatalogCategoryModel.findAll({
						attributes: ['category_id'],
						where: { catalog_id: catalogId, seller_id: isSpecialAdmin ? null : sellerId }
					})
				) as CatalogCategory[];

				console.log('currentCategoriesList::', currentCategoriesList);
				console.log('categoriesListResponse::', categoriesListResponse);

				const catalogCatsList = categoriesListResponse.reduce((acc: ICatalogCategory[], id: number) => {
					if (currentCategoriesList.some(({ category_id }) => category_id === id)) return acc;
					acc.push({
						category_id: id,
						catalog_id: catalogId,
						seller_id: isSpecialAdmin ? null : sellerId
					});
					return acc;
				}, [] as ICatalogCategory[]);
				console.log('catalogCatsList', catalogCatsList);
				await Promise.all([
					this.CatalogCategoryModel.bulkCreate(catalogCatsList as any, {
						ignoreDuplicates: true,
						logging: true
					}),
					this.categoryService.updateCatalogInCategoriesList(
						catalogId,
						(catalogCatsList as any).map(({ category_id }) => category_id)
					)
				]);
			}
		}
	}

	async checkUpdateCatalogValidation(
		catalogId: number,
		payloadData: {
			catalog_name: string;
		}
	): Promise<void> {
		const checkCatalogExist = await this.CatalogModel.findOne({
			where: {
				[Op.and]: [
					sequelize.where(
						sequelize.fn('LOWER', sequelize.col('catalog_name')),
						payloadData.catalog_name.toLowerCase()
					),
					{
						id: {
							[Op.ne]: catalogId
						}
					}
				]
			}
		});

		if (checkCatalogExist) {
			throw new HttpException(messages.catalog.hasExist, HttpStatus.BAD_REQUEST);
		}
	}

	async getCatalogsList(user: IUserAuth, queryParams: CatalogQueryParamsDto): Promise<ResponseAbstractList<Catalog>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = CatalogQueryParamsDto.getQueryParamsWhereClause(queryParams);
		let includeOptions: any = undefined;
		if (user) {
			const { sellerId, roleCode } = user;
			const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
			if (!isSpecialAdmin) {
				includeOptions = {
					include: [{ model: Seller, through: { where: { seller_id: sellerId } }, required: true }]
				};
			}
		}

		const { rows, count } = await this.CatalogModel.findAndCountAll({
			where: whereClause,
			...includeOptions,
			order: [
				['index', 'ASC'],
				['updated_at', 'DESC']
			],
			offset,
			limit,
			logging: true
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

	async getAllActiveCatalogsList(queryParams: CatalogQueryParamsDto): Promise<ResponseAbstractList<Catalog>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = CatalogQueryParamsDto.getQueryParamsWhereClause({ ...queryParams, status: true });
		const includeOptions: any = undefined;

		const { rows, count } = await this.CatalogModel.findAndCountAll({
			where: whereClause,
			...includeOptions,
			order: [
				['index', 'ASC'],
				['updated_at', 'DESC']
			],
			offset,
			limit,
			logging: true
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

	async getCatalogById({ sellerId, roleCode }: IUserAuth, id: number): Promise<Catalog> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const catalogResponse = await this.CatalogModel.findByPk(id, {
			include: [
				{
					model: CatalogCategory,
					include: [{ model: Category }],
					order: [['updated_at', 'DESC']],
					where: { seller_id: isSpecialAdmin ? null : sellerId },
					required: false
				}
			],
			logging: true
		});

		if (!catalogResponse) {
			throw new HttpException(messages.catalog.notFound, HttpStatus.NOT_FOUND);
		}

		const catalog = catalogResponse.toJSON();

		const categoriesByLevel: Category[] = _.orderBy(
			catalog?.catalogCategories.reduce((categoriesList: any[], categoryItem) => {
				const category = {
					...categoryItem.category,
					...categoryItem
				};
				delete category.category;

				categoriesList.push(category);
				return categoriesList;
			}, []),
			['level'],
			['desc']
		);

		catalog.categories = categoriesByLevel.reduce((res: Category[], item: any) => {
			const childrenCats = res.filter((resItem) => resItem.parent_id === item.category_id);
			if (childrenCats.length) {
				item['children'] = childrenCats;
				for (const childCat of childrenCats) {
					const resIndex = res.findIndex((resItem) => resItem.id === childCat.id);
					res.splice(resIndex, 1);
				}
			}
			res.push(item);
			return res;
		}, []) as Category[];

		delete catalog.catalogCategories;

		return catalog;
	}

	async updateCategoryStatusInCatalog(id: number, status: boolean): Promise<void> {
		await this.CatalogCategoryModel.update({ status }, { where: { id } });
	}

	async createSellerCategoryByCatalogId(sellerId: number, catalogId: number, transaction: Transaction) {
		const catalogResponse = await this.CatalogModel.findByPk(catalogId, {
			include: [
				{
					model: CatalogCategory,
					include: [Category],
					order: [['level', 'ASC']]
				}
			]
		});

		if (!catalogResponse) return;

		const categoriesList = catalogResponse.toJSON().catalogCategories.map((item) => {
			const categoryItem = { ...item.category };
			delete categoryItem.id;
			return {
				...categoryItem,
				seller_id: sellerId
			};
		});

		await this.CategoryModel.bulkCreate(categoriesList, { transaction });
	}

	async updateCatalogIndex(data: UpdateCatalogIndexDto): Promise<void> {
		await this.CatalogModel.bulkCreate(data.catalogs as any, {
			updateOnDuplicate: ['index']
		});
	}

	async getCatalogsBySellerId(sellerId: number): Promise<Catalog[]> {
		return this.CatalogModel.findAll({
			include: [
				{
					model: Seller,
					attributes: [],
					required: true,
					through: { where: { seller_id: sellerId }, attributes: [] }
				}
			],
			logging: true
		});
	}

	async getAllCatalogsList(): Promise<Catalog[]> {
		return this.CatalogModel.findAll();
	}

	async findByCatalogName(catalogName: string) : Promise<Catalog> {
		return await this.CatalogModel.findOne({ where: { catalog_name: catalogName } });
	}
}
