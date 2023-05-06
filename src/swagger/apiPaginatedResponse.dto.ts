import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { Type } from '@nestjs/passport';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedDto } from 'src/dtos/page.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) =>
	applyDecorators(
		ApiOkResponse({
			schema: {
				anyOf: [
					{ $ref: getSchemaPath(PaginatedDto) },
					{
						properties: {
							data: {
								type: 'array',
								items: { $ref: getSchemaPath(model) }
							}
						}
					}
				]
			}
		})
	);
