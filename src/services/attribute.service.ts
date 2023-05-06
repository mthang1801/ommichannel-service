import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { filterSeperator } from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { CreateAttributePayload, UpdateAttributePayload } from 'src/dtos/attributePayload.dto';
import { AttributeQueryParams } from 'src/dtos/requests/attributes/attributesQueryParams.dto';
import { UpdateAttributeCategoryDto } from 'src/dtos/requests/attributes/updateAttributeCategory.dto';
import { UpdateAttributeStatusDto } from 'src/dtos/requests/attributes/updateAttributeStatus';
import { CategoryQueryParamsDto } from 'src/dtos/requests/category/queryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Attribute } from 'src/models/attribute.model';
import { AttributeValue } from 'src/models/attributeValue.model';
import { Category } from 'src/models/category.model';
import { CategoryAttribute } from 'src/models/categoryAttribute.model';
import {
	checkOnlyUpdateStatus,
	convertToPrimitiveChain,
	filterData,
	geneUniqueKey,
	getPageOffsetLimit,
	parseDataSqlizeResponse
} from 'src/utils/functions.utils';
import { CategoryService } from './category.service';

@Injectable()
export class AttributeService {
	constructor(
		@InjectModel(Attribute)
		private readonly AttributeModel: typeof Attribute,
		@InjectModel(AttributeValue)
		private readonly AttributeValueModel: typeof AttributeValue,
		@InjectModel(CategoryAttribute)
		private readonly CategoryAttributeModel: typeof CategoryAttribute,
		@Inject(forwardRef(() => CategoryService))
		private readonly categoryService: CategoryService
	) {}

	async attributeValidation(sellerId: number, data: any, id: number = null) {
		const whereClause: any = {
			seller_id: sellerId
		};

		if (data.attribute_code) {
			whereClause.attribute_code = data.attribute_code;
			if (id) {
				whereClause.id = {
					[Op.ne]: id
				};
			}
			const attributeExist = await this.AttributeModel.findOne({
				where: whereClause
			});

			if (attributeExist) {
				throw new HttpException(messages.attributes.duplicateError, HttpStatus.CONFLICT);
			}
			return;
		}

		throw new HttpException(messages.attributes.invalidData, HttpStatus.BAD_REQUEST);
	}

	async createAttribute(sellerId: number, payload: CreateAttributePayload, transaction: Transaction) {
		await this.attributeValidation(sellerId, payload);
		const uniqueValue: any = {};
		const attributePayload = {
			...payload,
			purposes: payload.purposes,
			values: payload.values.map((valueItem, i) => {
				let valueCode: string = [payload.attribute_code, convertToPrimitiveChain(valueItem.value_name, '-')]
					.filter(Boolean)
					.join('-')
					.toUpperCase();

				if (Object.values(uniqueValue).includes(valueCode)) {
					valueCode = `${valueCode}-${i}`;
				}

				if (uniqueValue[valueItem.value_name.trim()]) {
					throw new HttpException(messages.attributes.duplicateError, HttpStatus.BAD_REQUEST);
				} else {
					uniqueValue[valueItem.value_name.trim()] = valueCode;
				}

				return {
					...valueItem,
					value_code: valueCode
				};
			})
		};

		await this.AttributeModel.create(attributePayload, {
			include: [AttributeValue],
			transaction
		});
	}

	async updateAttribute(sellerId: number, id: number, payloadData: UpdateAttributePayload, transaction: Transaction) {
		const currentAttribute = (
			await this.AttributeModel.findOne({
				where: { id, seller_id: sellerId },
				include: [AttributeValue]
			})
		).toJSON();

		if (!currentAttribute) {
			throw new HttpException(messages.attributes.attributeNotFound, HttpStatus.NOT_FOUND);
		}

		const payload: UpdateAttributePayload = filterData(payloadData);

		let updatedValues: any[] = [];
		const uniqueUpdatedValue: any = {};
		const uniqueNewValue: any = {};
		const uniqueValue: any = {};

		if (payload.updated_values) {
			updatedValues = [...payload.updated_values];
			if (currentAttribute?.values?.length) {
				updatedValues = [
					...payload.updated_values,
					...parseDataSqlizeResponse(currentAttribute).values.filter(
						(item) => !payload.updated_values.some((updatedValueItem) => updatedValueItem?.id === item.id)
					)
				];
			}

			for (const valueItem of updatedValues) {
				if (uniqueValue[valueItem.value_name]) {
					throw new HttpException(messages.attributes.duplicateError, HttpStatus.BAD_REQUEST);
				}

				const attributeCode = payload.attribute_code || currentAttribute.attribute_code;

				const genValueCode = [attributeCode, convertToPrimitiveChain(valueItem.value_name, '-')]
					.filter(Boolean)
					.join('-')
					.toUpperCase();

				uniqueValue[valueItem.value_name] = genValueCode;

				if (valueItem.id) {
					uniqueUpdatedValue[valueItem.value_name] = genValueCode;
				} else {
					uniqueNewValue[valueItem.value_name] = genValueCode;
				}
			}
		}

		if (checkOnlyUpdateStatus(payload)) {
			return await this.updateAttributeAndStatus(id, payload, transaction);
		} else {
		}

		const attributePayload: any = {
			...payload
		};

		await this.updateAttributeAndStatus(id, attributePayload, transaction);

		if (payload?.removed_values?.length) {
			await Promise.all(
				payload.removed_values.map(async (id) => {
					await this.AttributeValueModel.destroy({
						where: { id },
						transaction
					});
				})
			);
		}
		const attributesCodeList = [];
		if (updatedValues?.length) {
			const updateAttributeValuesList = updatedValues.filter((valueItem) => valueItem.id);

			if (updateAttributeValuesList.length) {
				await Promise.all(
					updateAttributeValuesList.map(async (valueItem, i) => {
						let valueCode = uniqueUpdatedValue[valueItem.value_name];
						if (attributesCodeList.includes(valueCode)) {
							valueCode = valueCode + '-' + String(i);
						} else {
							attributesCodeList.push(valueCode);
						}

						const attributeValuePayload: any = {
							...valueItem,
							value_code: valueCode
						};
						await this.AttributeValueModel.update(attributeValuePayload, {
							where: { id: valueItem.id },
							transaction
						});
					})
				);
			}

			const newAttributeValuesList = updatedValues.filter((valueItem) => !valueItem.id);

			if (newAttributeValuesList.length) {
				const newAttributeValuesListPayload = newAttributeValuesList.map((valueItem, i) => {
					let valueCode = uniqueValue[valueItem.value_name];
					if (attributesCodeList.includes(valueCode)) {
						valueCode = valueCode + '-' + geneUniqueKey();
					} else {
						attributesCodeList.push(valueCode);
					}

					return {
						...valueItem,
						attribute_id: id,
						value_code: valueCode
					};
				});
				await this.AttributeValueModel.bulkCreate(newAttributeValuesListPayload, { transaction });
			}
		}
	}

	async updateCategoryAttributeWhenChangeStatus(attributeId: number, status: boolean, transaction: Transaction) {
		await this.CategoryAttributeModel.update({ status }, { where: { attribute_id: attributeId }, transaction });
	}

	async updateAttributeAndStatus(attributeId: number, payloadData: UpdateAttributePayload, transaction: Transaction) {
		await Promise.all([
			this.AttributeModel.update(
				{ status: payloadData.status },
				{
					where: { id: attributeId },
					transaction
				}
			),
			this.updateCategoryAttributeWhenChangeStatus(attributeId, payloadData.status, transaction)
		]);
	}

	async updateAttributeStatus(id: number, sellerId: number, data: UpdateAttributeStatusDto) {
		const checkExist = await this.AttributeModel.findOne({
			where: { id, seller_id: sellerId }
		});
		if (!checkExist) {
			throw new HttpException(messages.responseStatus.notFound('thuộc tính'), HttpStatus.NOT_FOUND);
		}
		await this.AttributeModel.update({ status: data.status }, { where: { id } });
	}

	async getListAttributes(
		sellerId: number,
		queryParams: AttributeQueryParams
	): Promise<ResponseAbstractList<Attribute>> {
		const { include_values } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		const whereClause = AttributeQueryParams.SearchFilterByQueryParams(sellerId, queryParams);

		const include: any = include_values ? [{ model: AttributeValue, order: [['index', 'DESC']] }] : [];

		const { count, rows } = await this.AttributeModel.findAndCountAll({
			where: whereClause,
			include,
			order: [['created_at', 'DESC']],
			limit,
			offset
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

	async getAttributeById(sellerId: number, id: number): Promise<any> {
		const result = await this.AttributeModel.findOne({
			where: { seller_id: sellerId, id },
			include: [AttributeValue, Category],
			order: [[{ model: AttributeValue, as: 'values' }, 'index', 'ASC']]
		});

		if (!result) {
			throw new HttpException(messages.responseStatus.notFound('thuộc tính'), HttpStatus.NOT_FOUND);
		}

		return result;
	}

	async getCategoriesList(
		attributeId: number,
		queryParams: CategoryQueryParamsDto
	): Promise<ResponseAbstractList<any>> {
		return this.categoryService.getCategoriesListByAttributeId(attributeId, queryParams);
	}

	async updateAttributeCategory(id: number, data: UpdateAttributeCategoryDto): Promise<void> {
		const payloadData = filterData<UpdateAttributeCategoryDto>(data);

		if (payloadData.removed_categories) {
			await this.CategoryAttributeModel.destroy({
				where: {
					category_id: { [Op.in]: payloadData.removed_categories },
					attribute_id: id
				}
			});
		}

		if (payloadData.new_categories) {
			const newCategoriesPayload = payloadData.new_categories.map((newCategoryId) => ({
				attribute_id: id,
				category_id: newCategoryId
			}));
			await this.CategoryAttributeModel.bulkCreate(newCategoriesPayload, {
				ignoreDuplicates: true
			});
		}

		const categoriesStringListByAttributeId = await this.getCategoriesListByAttributeId(id);
		await this.AttributeModel.update({ categories_list: categoriesStringListByAttributeId }, { where: { id } });
	}

	async getCategoriesListByAttributeId(attributeId: number) {
		return (await this.CategoryAttributeModel.findAll({ where: { attribute_id: attributeId } }))
			.map((catAttrItem) =>
				catAttrItem ? `${filterSeperator}${catAttrItem.category_id}${filterSeperator}` : null
			)
			.filter(Boolean)
			.join(',');
	}
}
