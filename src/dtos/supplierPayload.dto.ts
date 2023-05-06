export class SupplierPayloadDto {
	supplier_code?: string;

	supplier_name: string;

	phone?: string;

	email?: string;

	province_id: number;

	district_id: number;

	ward_id: number;

	address: string;

	tax_code?: string;

	fax?: string;

	website?: string;

	account_number: string;

	account_name: string;

	payment_method_id: number;

	bank_id: number;

	status?: boolean;

	seller_id: number;
}
