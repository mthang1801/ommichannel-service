export interface ISeller {
	id?: number;
	seller_name: string;
	phone?: string;
	email: string;
	country_name?: string;
	country_id?: number;
	province_name?: string;
	province_id?: number;
	district_name?: string;
	district_id?: number;
	ward_name?: string;
	ward_id?: number;
	address?: string;
	fax?: string;
	note?: string;
	user_id?: number;
}

export interface ISellerUniqueField {
	phone?: string;
	email?: string;
	fax?: string;
}
