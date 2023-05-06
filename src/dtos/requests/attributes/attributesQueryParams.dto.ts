import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { Op } from 'sequelize';
import { AttributeFilterTypeEnum, AttributePurposeEnum, AttributeTypeEnum } from 'src/common/constants/enum';
import { filterQueryParams, filterValueORRegExpString } from 'src/utils/functions.utils';

export class AttributeQueryParams {
	@IsOptional()
	q?: string;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	status: string;

	@IsOptional()
	category_ids: string;

	@IsOptional()
	@IsEnum(AttributePurposeEnum)
	purposes: AttributePurposeEnum;

	@IsOptional()
	@IsEnum(AttributeTypeEnum)
	attribute_type: AttributeTypeEnum;

	@IsOptional()
	@IsEnum(AttributeFilterTypeEnum)
	filter_type: AttributeFilterTypeEnum;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => (value === 'false' ? false : true))
	include_values = false;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	page: string;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	limit: number;

	static SearchFilterByQueryParams(sellerId: number, queryParams: AttributeQueryParams) {
		const searchFilterParams = filterQueryParams({ ...queryParams, seller_id: sellerId });

		return Object.entries(searchFilterParams).reduce((whereClause: any, [_, [key, val]]: any) => {
			if (key === 'include_values') return whereClause;
			switch (key) {
				case 'q':
					{
						whereClause = {
							...whereClause,
							[Op.or]: {
								attribute_code: {
									[Op.like]: `%${val}%`
								},
								attribute_name: {
									[Op.like]: `%${val}%`
								}
							}
						};
					}
					break;
				case 'category_ids':
					{
						whereClause['categories_list'] = {
							[Op.regexp]: filterValueORRegExpString(String(val))
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
}
