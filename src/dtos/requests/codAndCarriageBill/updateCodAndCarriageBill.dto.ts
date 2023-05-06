import { ArrayNotEmpty, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class UpdateCodAndCarriageBillDto {
	@IsOptional()
	@IsString()
	note: string;

	@IsOptional()
	@IsString()
	verified_by: string;

	@IsOptional()
	@IsString()
	verified_at: string;

	@IsOptional()
	@IsNumber()
	payment_status: number;

	@IsOptional()
	@IsNumber()
	payment_method: number;

	@IsOptional()
	@IsNumber()
	paid_amount: number;

	@IsOptional()
	@IsString()
	payment_at: string;

	@IsOptional()
	@IsString()
	payment_ref_code: string;

	@IsOptional()
	@IsNumber()
	for_control_status: number;

	@ArrayNotEmpty()
	details: CodAndCarriageBillDetail[];
}

class CodAndCarriageBillDetail {
	@IsNotEmpty()
	@IsNumber()
	order_delivery_id: number;
}
