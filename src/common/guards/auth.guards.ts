import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import messages from 'src/common/constants/messages';
import { jwtConfig, userAuthConfig } from 'src/configs/configs';
import { IApiMenu } from 'src/interfaces/funct.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CachingService } from 'src/microservices/caching/caching.service';
import { ApiMethod } from 'src/types/apiMethod.type';
import { cachingKey, hashCachingKey } from '../../configs/caching';
import {
	authSeperator,
	convertUserAuthUUIDIntoUserRole,
	decodeUserAuthentication,
	decodeUserAuthenticationInfo,
	getUserAuthenticationInfo,
	isAdminByRoleCode
} from './auth';
import { Metadata } from './customMetadata';
import { checkRouteRequestInExclusiveRoutesList } from './exclusiveAuth';

const {
	AUTH_USER_ID_POSITION,
	AUTH_USER_ROLE_CODE_POSITION,
	AUTH_USER_ROLE_ID_POSITION,
	AUTH_USER_SELLER_ID_POSITION
} = userAuthConfig;
interface IUserToken {
	uuid: string;
	iat: number;
	exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private reflector: Reflector, private readonly cachingService: CachingService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const skipAuth = this.reflector.get<boolean>(Metadata.SKIP_AUTH, context.getHandler());
		const request: Request = context.switchToHttp().getRequest();
		const contextType = context.getType<'http' | 'rmq'>();
		const authorization = request?.headers?.authorization as any;
		const uuid = request?.headers?.['x-auth-uuid'] as string;

		if (
			(skipAuth && (!authorization || !uuid)) ||
			contextType === 'rmq' ||
			checkRouteRequestInExclusiveRoutesList(
				request.route.path,
				String(request.method).toUpperCase() as ApiMethod
			)
		)
			return true;

		if (!authorization || !uuid) return false;
		const checkResult = this.checkTokenBearerAndAuthUUIDValidation(authorization, uuid);
		if (!checkResult) return false;

		const authUUID = decodeUserAuthentication(uuid);
		const authData = this.getAuthData(authUUID);

		const checkCachingTokenExist = await this.checkUserCachingTokenExist(authData.userId, authorization);
		if (!checkCachingTokenExist) return false;

		await this.validateFunction(authData, request);
		request['user'] = authData;
		return true;
	}

	checkTokenBearerAndAuthUUIDValidation(authorizationBearer: string, uuid: string): boolean {
		const token = authorizationBearer.split(' ').filter(Boolean).slice(-1)[0];
		const decodedResult = jwt.verify(token, jwtConfig.secret) as IUserToken;
		const { uuid: bearerUUID } = decodedResult;
		const authUUID = decodeUserAuthentication(uuid);
		if (!bearerUUID || !authUUID) {
			return false;
		}
		const decodeBearerUUID = decodeUserAuthenticationInfo(bearerUUID);
		const decodeAuthUUID = getUserAuthenticationInfo(authUUID);
		['userId', 'roleCode', 'roleId', 'sellerId'].forEach((key) => {			
			if (!decodeBearerUUID[key] || !decodeAuthUUID[key] || decodeBearerUUID[key] !== decodeAuthUUID[key])
				return false;
		});
		return true;
	}

	async checkUserCachingTokenExist(userId: number, authorizationBearer: string): Promise<boolean> {
		const token = authorizationBearer.split(' ').filter(Boolean).slice(-1)[0];
		const userTokenCachingKey = cachingKey.userToken(userId, token);
		if (await this.cachingService.exist(userTokenCachingKey)) return true;
		throw new HttpException(messages.auth.invalidToken, 408);
	}

	getAuthData(authUUID: string): IUserAuth {
		const splittedAuthUUID = authUUID.split(authSeperator);
		return {
			userId: Number(splittedAuthUUID[AUTH_USER_ID_POSITION]),
			roleCode: convertUserAuthUUIDIntoUserRole(splittedAuthUUID[AUTH_USER_ROLE_CODE_POSITION]),
			roleId: Number(splittedAuthUUID[AUTH_USER_ROLE_ID_POSITION]),
			sellerId: Number(splittedAuthUUID[AUTH_USER_SELLER_ID_POSITION])
		};
	}

	async validateFunction(user: IUserAuth, req: Request): Promise<void> {
		const cacheKey = cachingKey.hashUser(user.userId);
		const getApiMenu: string = await this.cachingService.hashGet(cacheKey, hashCachingKey.user.apiMenu);
		const {
			method,
			route: { path }
		} = req;
		const isAdmin = isAdminByRoleCode(user.roleCode);
		if (isAdmin) return;
		const apiMenuParser: IApiMenu[] = JSON.parse(getApiMenu);
		if (apiMenuParser.some((item) => item.api_route === path && method === item.method)) return;
		throw new HttpException(messages.auth.invalidToken, HttpStatus.FORBIDDEN);
	}
}
