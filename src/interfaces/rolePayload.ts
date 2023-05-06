export interface ICreateRolePayload {
	role_code: string;
	role_name: string;
	created_by: number;
	updated_by: number;
	level: number;
	status: boolean;
	parent_id: number;
	seller_id: number;
}
export interface IUpdateRolePayload {
	role_code?: string;
	role_name?: string;
	status?: boolean;
	updated_by: number;
}
