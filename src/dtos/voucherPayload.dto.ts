export class VoucherPayloadDto {
	voucher_code?: string;

	voucher_name?: string;

	amount?: number;

	description?: string;

	type?: number;

	discount?: number;

	min_order_value?: number;

	max_discount?: number;

	start_at?: string;

	stop_at?: string;

	status?: boolean;

	seller_id?: number;
}
