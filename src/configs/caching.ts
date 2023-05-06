import { PREFIX_SVC } from "src/common/constants/constant";

export const cachingKey = {
	benefitPackages: `${PREFIX_SVC}:config:benefit-packages`,
	userToken: (userId: number, token: string) => `${PREFIX_SVC}:user:${userId}:tokens:${token}`,
	hashUser: (userId: number) => {
		return `${PREFIX_SVC}:user:${String(userId)}`;
	},
	getUserTokenKeys: (userId : number) => `${PREFIX_SVC}:user:${userId}:tokens:*`,
	customerPoinConfig : (sellerId: number) => `${PREFIX_SVC}:seller:${sellerId}:point-config`,
	limitRequestByUserIp : (userIp:string) => `${PREFIX_SVC}:limit-request:${userIp}`,
	sellerServicePackage : (sellerId: number) => `${PREFIX_SVC}:seller:${sellerId}:service-package`,
	allKeysSellerServicePackage : `${PREFIX_SVC}:seller:*:service-package`
};

/**
 * Time to live for cache key (second) 
*/
export const keyTTL = {
	limitRequestByUserIp : 1 * 60,
	ttlForServicePackage : (days: number) =>  60 * 60 * 24 * days
}

export const hashCachingKey = {
	user: {
		apiMenu: 'apiMenu'
	}
};
