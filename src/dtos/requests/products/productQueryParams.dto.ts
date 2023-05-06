import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { IncludeOptions, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { filterSeperator } from 'src/common/constants/constant';
import { ProductLevelEnum, ProductStatusEnum, ProductTypeEnum } from 'src/common/constants/enum';
import { PromotionAppliedProduct } from 'src/models/promotionProgramAppliedProducts.model';
import { PromotionProgramEntityDetail } from 'src/models/promotionProgramEntityDetail.model';
import { formatDateTime, formatTime } from 'src/utils/dates.utils';
import { filterQueryParams, filterValueANDRegExpString, filterValueORRegExpString } from 'src/utils/functions.utils';
import { sequelize } from '../../../configs/db';
import { ProductInventory } from '../../../models/productInventory.model';

export class ProductQueryParams {
	@ApiProperty({ example: 'iphone 14' })
	@ApiPropertyOptional()
	@IsOptional()
	q?: string;

	@ApiProperty({ type: Boolean, example: true })
	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	status?: boolean;

	@ApiProperty({ example: 1 })
	@ApiPropertyOptional()
	@IsOptional()
	page?: number;

	@ApiProperty({ example: 10 })
	@ApiPropertyOptional()
	@IsOptional()
	limit?: number;

	@ApiProperty({
		example: `${ProductLevelEnum.Configure},${ProductLevelEnum.Independence}`
	})
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => (value ? value.split(',') : null))
	product_level?: string;

	@ApiProperty({
		example: `${ProductTypeEnum.Normal}`
	})
	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(ProductStatusEnum)
	product_type?: ProductStatusEnum;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	category_ids?: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => Number(value))
	warehouse_id?: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	catalog_id?: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	attributes_value_ids?: string;

	@ApiProperty({ example: ProductStatusEnum.Mới })
	@ApiPropertyOptional()
	@IsOptional()
	product_status?: ProductStatusEnum;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	created_at_start?: Date;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	created_at_end?: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true')
	include_promotion?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	customer_ranking?: string;

	@ApiPropertyOptional()
	@IsOptional()
	utm_source?: string;

	static SearchFilterByQueryParams(sellerId: number, queryParams: ProductQueryParams, isSpecialAdmin) {
		const filteredQueryParams = filterQueryParams(
			{
				...queryParams,
				seller_id: isSpecialAdmin ? null : sellerId
			},
			['include_promotion', 'customer_ranking', 'utm_source']
		);

		return Object.entries(filteredQueryParams).reduce((whereClause: any, [_, [key, val]]: any) => {
			switch (key) {
				case 'q':
					{
						whereClause = {
							...whereClause,
							[Op.or]: [
								{
									product_name: {
										[Op.like]: `%${val}%`
									}
								},
								{
									sku: {
										[Op.like]: `${val}%`
									}
								},
								{
									barcode: {
										[Op.like]: `${val}%`
									}
								}
							]
						};
					}
					break;
				case 'created_at_start':
				case 'created_at_end':
					{
						whereClause.created_at = {
							[Op.between]: [queryParams.created_at_start, queryParams.created_at_end]
						};
					}
					break;
				case 'product_level':
					{
						whereClause.product_level = {
							[Op.in]: val
						};
					}
					break;
				case 'category_ids':
					{
						whereClause.categories_list = {
							[Op.regexp]: filterValueORRegExpString(String(val))
						};
					}
					break;
				case 'warehouse_id':
					{
						whereClause.warehouse_ids_list = {
							[Op.regexp]: filterValueORRegExpString(String(val))
						};
					}
					break;
				case 'attributes_value_ids':
					{
						whereClause.attribute_ids_list = {
							[Op.regexp]: Sequelize.literal(`'${filterValueANDRegExpString(val)}'`)
						};
					}
					break;
				default: {
					whereClause[key] = val;
				}
			}

			return whereClause;
		}, {});
	}

	static includeJoinerByQueryParams(queryParams: ProductQueryParams) {
		const include: IncludeOptions[] = [];
		if (queryParams.include_promotion) {
			const promotionInclude: IncludeOptions = {
				model: PromotionAppliedProduct,
				where: {
					start_at: sequelize.literal(
						`(DATE(PromotionAppliedProduct.start_at) >= '${formatTime()}' OR PromotionAppliedProduct.start_at IS NULL)`
					),
					end_at: sequelize.literal(
						`(DATE(PromotionAppliedProduct.end_at) <= '${formatTime()}' OR PromotionAppliedProduct.end_at IS NULL)`
					),
					start_date: sequelize.literal(
						`(DATE(PromotionAppliedProduct.start_date) <= '${formatDateTime()}' OR PromotionAppliedProduct.start_date IS NULL)`
					),
					end_date: sequelize.literal(
						`(DATE(PromotionAppliedProduct.end_date) <= '${formatDateTime()}' OR PromotionAppliedProduct.end_date IS NULL)`
					),
					months_of_year: sequelize.literal(
						`(PromotionAppliedProduct.months_of_year IS NULL OR PromotionAppliedProduct.months_of_year LIKE '%${filterSeperator}MONTH(NOW())${filterSeperator}%')`
					),
					days_of_month: sequelize.literal(
						`(PromotionAppliedProduct.days_of_month IS NULL OR PromotionAppliedProduct.days_of_month LIKE '%${filterSeperator}DAYOFMONTH(NOW())${filterSeperator}%')`
					),
					not_include_dates: sequelize.literal(
						`(PromotionAppliedProduct.not_include_dates IS NULL OR PromotionAppliedProduct.not_include_dates NOT LIKE '%${filterSeperator}${formatDateTime()}${filterSeperator}%')`
					),
					include_dates: sequelize.literal(
						`(PromotionAppliedProduct.include_dates IS NULL OR PromotionAppliedProduct.include_dates LIKE '%${filterSeperator}${formatDateTime()}${filterSeperator}%')`
					),
					used_quantity: sequelize.literal(
						`(PromotionAppliedProduct.max_use_quantity IS NULL OR PromotionAppliedProduct.max_use_quantity >= PromotionAppliedProduct.used_quantity)`
					),
					status: true,
					customer_rankings: queryParams.customer_ranking
						? `(PromotionAppliedProduct.customer_rankings IS NULL OR PromotionAppliedProduct.customer_rankings LIKE '%${filterSeperator}${queryParams.customer_ranking}${filterSeperator}%')`
						: `(PromotionAppliedProduct.customer_rankings IS NULL)`,
					utm_sources: queryParams.utm_source
						? `(PromotionAppliedProduct.utm_sources IS NULL OR PromotionAppliedProduct.utm_sources LIKE '%${filterSeperator}${queryParams.utm_source}${filterSeperator}%')`
						: `(PromotionAppliedProduct.utm_sources IS NULL`
				},
				order: [['updated_at', 'DESC']],
				include: [],
				limit: 1
			};
			include.push(promotionInclude);
		}

		if (queryParams.warehouse_id) {
			const warehouse: IncludeOptions = {
				model: ProductInventory,
				where: {
					warehouse_id: queryParams.warehouse_id
				}
			};
			include.push(warehouse);
		}
		return include;
	}
}
