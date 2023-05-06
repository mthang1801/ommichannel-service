export interface IShippingUnitData {
	username?: string;
	password?: string;
}

export interface IShippingUnitNTLData {
	username: string;
	password: string;
	partner_id: number;
}

export interface IShippingUnitNTLResponse {
	username?: string;
	password?: string;
	partner_id?: number;
	partner_name?: string;
}

export interface IShippingUnitNTLCalcFee {
	cod_amount?: number;
	weight: number;
	payment_method_id?: number;
	s_province: string;
	s_district: string;
	r_province: string;
	r_district: string;
	service_id?: number;
}

export interface IShippingUnitNTLOrderCreate {
	partner_id: number;
	ref_code?: string;
	package_no?: number;
	s_name: string;
	s_phone: string;
	s_address: string;
	r_name: string;
	r_phone: string;
	r_address: string;
	r_email?: string;
	cod_amount?: number;
	service_id: number;
	payment_method_id: number;
	weight: number;
	lenth?: number;
	width?: number;
	height?: number;
	is_return_doc?: number;
	cargo_type_id: number;
	cargo_content?: string;
	cargo_value?: number;
	note?: string;
	utm_source: string;
}

export interface IShippingUnitNTLOrderCreateResponse {
	partner_id?: number;
	bill_id?: number;
	bill_code?: string;
	ref_code?: string;
	status_id?: number;
	cod_amount?: number;
	service_id?: number;
	payment_method?: number;
	created_at?: Date;
	main_fee?: number;
	cod_fee?: number;
	insurr_fee?: number;
	lifting_fee?: number;
	remote_fee?: number;
	counting_fee?: number;
	packing_fee?: number;
	total_fee?: number;
	parner_address_id?: string;
	receiver_name?: string;
	receiver_phone?: string;
	receiver_address?: string;
	package_no?: number;
	weight?: number;
	cargo_content?: string;
	cargo_value?: string;
	note?: string;
}
