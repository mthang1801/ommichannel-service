import { userAuthConfig } from 'src/configs/configs';

import { IEncodeUserAuthResponse, IUserAuth } from 'src/interfaces/userAuth.interface';
import { Cryptography } from 'src/utils/cryptography.utils';
import { v4 as uuid } from 'uuid';
import { UserRoleCodeEnum } from '../constants/enum';
export const authSeperator = '-';
const {
	AUTH_USER_ID_POSITION,
	SELLER_ADMIN_UUID,
	NT_ADMIN_UUID,
	AUTH_USER_ROLE_CODE_POSITION,
	AUTH_USER_ROLE_ID_POSITION,
	AUTH_USER_SELLER_ID_POSITION
} = userAuthConfig;

export const convertUserRoleCodeIntoUUID = (roleCode: string) => {
	switch (roleCode) {
		case UserRoleCodeEnum.SellerAdmin:
			return SELLER_ADMIN_UUID;
		case UserRoleCodeEnum.NTAdmin:
			return NT_ADMIN_UUID;
		default:
			return roleCode;
	}
};

export const convertUserAuthUUIDIntoUserRole = (uuid: string) => {
	switch (uuid) {
		case SELLER_ADMIN_UUID:
			return UserRoleCodeEnum.SellerAdmin;
		case NT_ADMIN_UUID:
			return UserRoleCodeEnum.NTAdmin;
		default:
			return uuid;
	}
};

export const encodeUserAuthentication = (
	userId: number,
	roleCode: string,
	roleId: number,
	sellerId: number
): IEncodeUserAuthResponse => {
	const authUserPositionList = Object.entries(userAuthConfig).filter(([_, val]) => typeof val === 'number');
	authUserPositionList.sort((a: any[], b: any[]) => a[1] - b[1]);
	const authUserPositionListMapper = new Map([...authUserPositionList]);
	let randomString: string = uuid();
	const randomStringArray: string[] = randomString.split('-');
	const inputParams = [];

	for (const [i, key] of Object.keys(Object.fromEntries(authUserPositionListMapper)).entries()) {
		switch (key) {
			case 'AUTH_USER_SELLER_ID_POSITION':
				inputParams[i] = Cryptography.EncodeBase64(String(sellerId));
				break;
			case 'AUTH_USER_ID_POSITION':
				inputParams[i] = Cryptography.EncodeBase64(String(userId));
				break;
			case 'AUTH_USER_ROLE_CODE_POSITION':
				inputParams[i] = convertUserRoleCodeIntoUUID(roleCode);
				break;
			case 'AUTH_USER_ROLE_ID_POSITION':
				inputParams[i] = Cryptography.EncodeBase64(String(roleId));
				break;
		}
	}
	for (const [i, pos] of Object.values(Object.fromEntries(authUserPositionListMapper)).entries()) {
		randomStringArray.splice(pos as number, 0, inputParams[i].toString() as string);
	}
	randomString = [...randomStringArray].join(authSeperator);
	const cryptography = new Cryptography();
	const encodedString = cryptography.encrypt(randomString);
	return { originalString: randomString, encodedString };
};

export const decodeUserAuthentication = (authString: string): string => {
	const cryptography = new Cryptography();
	const decodeString = cryptography.decrypt(authString);
	return decodeString
		.split(authSeperator)
		.map((item, i) => {
			if ([AUTH_USER_SELLER_ID_POSITION, AUTH_USER_ROLE_ID_POSITION, AUTH_USER_ID_POSITION].includes(i))
				return Cryptography.DecodeBase64(item);
			return item;
		})
		.join(authSeperator);
};

export const decodeUserAuthenticationInfo = (decodeString: string): IUserAuth => {
	const uuidStringArray = decodeString.split(authSeperator);
	const userId = Cryptography.DecodeBase64(uuidStringArray[AUTH_USER_ID_POSITION]);
	const roleCode = convertUserAuthUUIDIntoUserRole(uuidStringArray[AUTH_USER_ROLE_CODE_POSITION]);
	const roleId = Cryptography.DecodeBase64(uuidStringArray[AUTH_USER_ROLE_ID_POSITION]);
	const sellerId = Cryptography.DecodeBase64(uuidStringArray[AUTH_USER_SELLER_ID_POSITION]);
	return {
		userId: Number(userId),
		roleCode,
		roleId: Number(roleId),
		sellerId: Number(sellerId)
	};
};

export const getUserAuthenticationInfo = (decodeString: string): IUserAuth => {
	const uuidStringArray = decodeString.split(authSeperator);
	const userId = uuidStringArray[AUTH_USER_ID_POSITION];
	const roleCode = convertUserAuthUUIDIntoUserRole(uuidStringArray[AUTH_USER_ROLE_CODE_POSITION]);
	const roleId = uuidStringArray[AUTH_USER_ROLE_ID_POSITION];
	const sellerId = uuidStringArray[AUTH_USER_SELLER_ID_POSITION];
	return {
		userId: Number(userId),
		roleCode,
		roleId: Number(roleId),
		sellerId: Number(sellerId)
	};
};

const adminRoles: string[] = [UserRoleCodeEnum.SellerAdmin, UserRoleCodeEnum.NTAdmin];

export const isAdminByRoleCode = (roleCode: string) => adminRoles.includes(roleCode);

const specialAdminRoles: string[] = [UserRoleCodeEnum.NTAdmin];

export const isSpecialAdminByRoleCode = (roleCode: string) => specialAdminRoles.includes(roleCode);

export const SPECIAL_ADMIN_SELLER_ID = 5 ;