import { ApiMethod } from "src/types/apiMethod.type";

const exclusiveRoutesList = {
	GET: ['/api/v1/provinces', '/api/v1/districts', '/api/v1/wards', '/api/v1/catalogs/all'],
	POST: [],
	PUT: [],
	DELETE: []
};

export const checkRouteRequestInExclusiveRoutesList = (
	routeRequest: string,
	method: ApiMethod
) => {
	return exclusiveRoutesList[method].includes(routeRequest);
};
