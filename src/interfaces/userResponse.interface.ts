export interface IUserResponse {
	status: string;
	is_deactive: number;
	fullname: string;
	account_type: number;
	gender: number;
	email: string;
	phone: string;
	country: string;
	country_id: string;
	province: string;
	province_id: string;
	district: string;
	district_id: string;
	ward: string;
	ward_id: string;
	address: string;
	avatar: string;
	created_at: string;
	updated_at: string;
	seller_id?: number;
}
