import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateCodAndCarriageBillDto {
	@IsNotEmpty()
	@IsNumber()
	shipping_unit_id: number;

	@IsOptional()
	@IsString()
	verified_by: string;

	@IsOptional()
	@IsString()
	note: string;

	@ArrayNotEmpty()
	details: CodAndCarriageBillDetail[];
}

class CodAndCarriageBillDetail {
	@IsNotEmpty()
	@IsNumber()
	order_delivery_id: number;
}
