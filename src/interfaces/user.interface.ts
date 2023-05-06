export interface IUserSignUpAccount {
	seller_id: number;
	fullname: string;
	phone: string;
	email: string;
	password: string;
}

export interface IUserAccountUniqueField {
	phone?: string;
	email?: string;
}

export interface IUserActivateEmail {
	fullname: string;
	email: string;
	url: string;
}

export interface ICheckUserExist {
	statusCode : number;
	message?: string;
}