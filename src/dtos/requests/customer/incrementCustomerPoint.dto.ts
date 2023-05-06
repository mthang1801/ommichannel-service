import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomerHistoryPointOperatorEnum, CustomerHistoryPointRefSourceEnum } from 'src/common/constants/enum';
export class IncrementCustomerPointDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	seller_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	customer_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description: string;

	@ApiPropertyOptional()
	@IsOptional()
	ref_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(CustomerHistoryPointRefSourceEnum)
	ref_source: CustomerHistoryPointRefSourceEnum;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(CustomerHistoryPointOperatorEnum)
	type_operator: CustomerHistoryPointOperatorEnum = CustomerHistoryPointOperatorEnum.add;

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsNumber()
	goods_total_price: number;
}
