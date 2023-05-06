import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { ApiCreatedResponse, ApiProperty } from '@nestjs/swagger';

export class CreatedResponseDto {
	@ApiProperty({ type: String, default: true })
	success: boolean;

	@ApiProperty({ type: Number, default: 201 })
	statusCode: 201;

	@ApiProperty({ default: null })
	data: any;

	@ApiProperty({ type: String, default: 'Tạo thành công.' })
	message: any;
}

export const ApiCreatedResponseExtra = () => {
	return applyDecorators(ApiCreatedResponse({ type: CreatedResponseDto }));
};
