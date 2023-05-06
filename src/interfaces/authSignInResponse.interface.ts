import { IUserResponse } from './userResponse.interface';

export class IAuthSignInResponse {
	user: IUserResponse;
	token?: string;
	uuid?: string;
}
