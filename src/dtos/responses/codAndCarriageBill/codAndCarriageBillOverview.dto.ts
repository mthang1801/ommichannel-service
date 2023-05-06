import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

export class CodAndCarriageBillDto {
	@ApiProperty()
	@IsOptional()
	for_control_status?: number;

	@ApiProperty()
	@IsOptional()
	billCount: number;

	@ApiProperty()
	@IsOptional()
	COD: number;

	@ApiProperty()
	@IsOptional()
	shippingFee: number;

	@ApiProperty()
	@IsOptional()
	forControlStatusName?: string;
}

export class CodAndCarriageBillOverviewResponseDto {
	@ApiPropertyOptional()
	@ValidateNested()
	@Type(() => CodAndCarriageBillDto)
	details: CodAndCarriageBillDto[];

	@ApiPropertyOptional()
	@Type(() => CodAndCarriageBillDto)
	summary : CodAndCarriageBillDto
}
