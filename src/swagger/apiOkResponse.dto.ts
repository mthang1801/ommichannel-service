import { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';

export class OkResponseDto<T> {
	@ApiProperty({ example: 200 })
	statusCode: number;

	@ApiProperty({ example: true })
	success: boolean;

	@ApiProperty()
	data: T;

	@ApiProperty({ example: 'Thành công.' })
	message: boolean;
}

export const ApiOkResponseExtra = <TModel extends Type<any>>(model: TModel) =>
	applyDecorators(ApiOkResponse({ schema: {} }));
