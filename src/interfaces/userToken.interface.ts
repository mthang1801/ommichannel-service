export interface IUserToken {
	user_id: number;
	type: number;
	access_token: string;
	secret_key: string;
	refresh_token?: string;
	expired_at?: Date;
}
