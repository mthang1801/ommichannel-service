export interface IUserAuth {
	userId: number;
	roleCode: string;
	roleId: number;
	sellerId: number;
}

export interface IEncodeUserAuthResponse {
	originalString: string;
	encodedString: string;
}

export interface IUserCache {}
