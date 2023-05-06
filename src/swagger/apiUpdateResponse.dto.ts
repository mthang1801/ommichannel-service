import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { ApiCreatedResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';

export class UpdateResponseDto {
	@ApiProperty({ type: String, default: true })
	success: boolean;

	@ApiProperty({ type: Number, default: 200 })
	statusCode: 200;

	@ApiProperty({ default: null })
	data: any;

	@ApiProperty({ type: String, default: 'Thành công.' })
	message: any;
}

export const ApiUpdateResponseExtra = () => {
	return applyDecorators(ApiOkResponse({ type: UpdateResponseDto }));
};
