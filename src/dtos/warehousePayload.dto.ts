export class WarehousePayloadDto {
	warehouse_code?: string;

	warehouse_name?: string;

	phone?: string;

	full_address?: string;

	ward_id?: number;

	district_id?: number;

	province_id?: number;

	address?: string;

	status?: boolean;

	longitude?: string;

	latitude?: string;

	seller_id?: number;

	ward_name?: string;

	district_name?: string;

	province_name?: string;

	qty_in_stock?: number;
}

export class CreateWarehousePayload extends WarehousePayloadDto {}

export class UpdateWarehousePayload extends WarehousePayloadDto {}
