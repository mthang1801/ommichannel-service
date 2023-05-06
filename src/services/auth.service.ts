import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { ProviderTypeEnum, UserAccountStatusActionTypeEnum, UserTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { decodeUserAuthentication } from 'src/common/guards/auth';
import { AMQPExchange, AMQPRoutingKey } from 'src/configs/amqp';
import { cachingKey, hashCachingKey } from 'src/configs/caching';
import { jwtConfig, urlConfig, userAuthConfig } from 'src/configs/configs';
import { sequelize } from 'src/configs/db';
import { ActivateAccountDto } from 'src/dtos/requests/auth/activateAccount.dto';
import { ReactivateAccountDto } from 'src/dtos/requests/auth/reactivateAccount.dto';
import { RecoveryAccountDto } from 'src/dtos/requests/auth/recoveryAccount.dto';
import { SignInDto } from 'src/dtos/requests/auth/signIn.dto';
import { SignInProviderDto } from 'src/dtos/requests/auth/signInGoogle.dto';
import { SignUpDto } from 'src/dtos/requests/auth/signup.dto';
import { UpdatePwdRecoveryAccountDto } from 'src/dtos/requests/auth/updatePwdFromRecoveryAccount.dto';
import { SigninResponseDto } from 'src/dtos/responses/auth/signin.dto';
import { IApiMenu } from 'src/interfaces/funct.interface';
import { ICheckUserExist, IUserActivateEmail, IUserSignUpAccount } from 'src/interfaces/user.interface';
import { IEncodeUserAuthResponse, IUserAuth } from 'src/interfaces/userAuth.interface';
import { CachingService } from 'src/microservices/caching/caching.service';
import { Role } from 'src/models/role.model';
import { Seller } from 'src/models/seller.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/userRole.model';
import { UserToken } from 'src/models/userToken.model';
import { Cryptography } from 'src/utils/cryptography.utils';
import { getKeyByValue, parseDataSqlizeResponse } from 'src/utils/functions.utils';
import {
	convertUserRoleCodeIntoUUID,
	encodeUserAuthentication,
	isAdminByRoleCode,
	isSpecialAdminByRoleCode
} from '../common/guards/auth';
import { keyTTL } from '../configs/caching';
import { AMQPService } from './amqp.service';
import { CatalogService } from './catalog.service';
import { CategoryService } from './category.service';
import { FunctService } from './funct.service';
import { RoleService } from './role.service';
import { SellerService } from './seller.service';
import { SellerGeneralSettingService } from './sellerGeneralSetting.service';
import { ServicePackageService } from './servicePackage.service';
import { UserService } from './user.service';
import { WarehouseService } from './warehouse.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User) private readonly UserModel: typeof User,
		@InjectModel(UserToken)
		private readonly UserTokenModel: typeof UserToken,
		private readonly userService: UserService,
		private readonly roleService: RoleService,
		private readonly sellerService: SellerService,
		private readonly functService: FunctService,
		private readonly jwtService: JwtService,
		private readonly cachingService: CachingService,
		@Inject(forwardRef(() => WarehouseService)) private readonly warehouseService: WarehouseService,
		@Inject(forwardRef(() => SellerGeneralSettingService))
		private readonly sellerGeneralSettingService: SellerGeneralSettingService,
		@Inject(forwardRef(() => CategoryService)) private readonly categoryService: CategoryService,
		@Inject(forwardRef(() => CatalogService)) private readonly catalogService: CatalogService,
		@Inject(forwardRef(() => ServicePackageService)) private readonly servicePackageService: ServicePackageService,
		private readonly amqpService: AMQPService
	) {}

	async signUp(data: SignUpDto): Promise<void> {
		const transaction = await sequelize.transaction();
		try {
			const newSeller = await this.sellerService.create(data, transaction);
			const userPayload: IUserSignUpAccount = {
				...data,
				seller_id: newSeller.id
			};
			const newUser = await this.userService.createUserAccount(userPayload, transaction);
			const newRole = await this.roleService.createSellerAdminRole(newSeller.id, transaction);
			await Promise.all([
				this.roleService.createUserRole(newUser.id, newRole.id, transaction),
				this.createTokenAndSendMail(newUser, UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT, transaction),
				this.sellerGeneralSettingService.createGeneralSetting(newSeller.id, transaction),
				this.categoryService.createCategoryForSellerByCatalogId(data.catalog_id, newSeller.id, transaction),
				this.warehouseService.createCentralWarehouse(newSeller.id, data, transaction),
				this.servicePackageService.createServicePackageFreeTrialFromSignUp(
					newSeller.id,
					newUser.id,
					transaction
				)
			]);
			await transaction.commit();
			await this.categoryService.updateCategoryFromRootIdPathForNewSeller(newSeller.id);
		} catch (error) {
			await transaction.rollback();
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	async signIn(data: SignInDto): Promise<SigninResponseDto> {
		const user = await this.userService.getUserSignin(data);
		this.validate(data.password, user.password, user.salt);
		return await this.signInResponse(user);
	}

	async activateAccount(data: ActivateAccountDto, transaction: Transaction): Promise<void> {
		try {
			const { secret_key, access_token } = data;
			const tokenValidation = await this.userService.tokenValidation(access_token, secret_key, data.type);
			await Promise.all([
				this.userService.updateToActivatedAccount(tokenValidation.user_id, transaction),
				this.userService.removeUserTokenByUserId(
					tokenValidation.user_id,
					UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT,
					transaction
				)
			]);
		} catch (error) {
			throw new HttpException(error.response, error.status);
		}
	}

	async reactivateAccount(data: ReactivateAccountDto, req: Request): Promise<void> {
		await this.checkUserIPHasLimitRequest(req.ip);
		const transaction = await sequelize.transaction();
		try {
			const { email } = data;
			const userAccountValidation = await this.accountValidation(
				email,
				UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT
			);
			await this.createTokenAndSendMail(
				userAccountValidation,
				UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT,
				transaction
			);
			await Promise.all([transaction.commit(), this.limitRequestMailServiceByUserIP(req.ip)]);
		} catch (error) {
			await transaction.rollback();
			throw new HttpException(error.message, error.status);
		}
	}

	async checkUserExist(email: string): Promise<ICheckUserExist> {
		const userExist = await this.UserModel.findOne({ where: { email } });
		if (!userExist) {
			return {
				statusCode: 0,
				message: messages.auth.userHasNotExisted
			};
		}
		return {
			statusCode: 1,
			message: messages.auth.userHasExisted
		};
	}

	async recoveryAccount(data: RecoveryAccountDto, req: Request): Promise<void> {
		await this.checkUserIPHasLimitRequest(req.ip);
		const transaction = await sequelize.transaction();
		try {
			const { email } = data;

			const userAccountValidation = await this.accountValidation(
				email,
				UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT
			);
			await this.createTokenAndSendMail(
				userAccountValidation,
				UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT,
				transaction
			);
			await Promise.all([transaction.commit(), this.limitRequestMailServiceByUserIP(req.ip)]);
		} catch (error) {
			await transaction.rollback();
			throw new HttpException(error.message, error.status);
		}
	}

	async updatePasswordRecoveryAccount(data: UpdatePwdRecoveryAccountDto, transaction: Transaction): Promise<void> {
		const { password, access_token, secret_key } = data;
		const checkTokenValidation = await this.userService.tokenValidation(
			access_token,
			secret_key,
			UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT
		);
		await Promise.all([
			this.userService.updateNewPasswordByUserId(checkTokenValidation.user_id, password, transaction),
			this.userService.removeUserTokenByUserId(
				checkTokenValidation.user_id,
				UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT,
				transaction
			)
		]);
	}

	async signInProvider(data: SignInProviderDto, providerType: ProviderTypeEnum): Promise<SigninResponseDto> {
		const transaction = await sequelize.transaction();
		try {
			let userAccount = await this.accountProviderValidation(data.email, providerType, data.providerId);
			if (!userAccount) {
				userAccount = await this.createAccountProvider(data, providerType, transaction);
				await transaction.commit();
			}
			return await this.signInResponse(userAccount);
		} catch (error) {
			console.log(error.stack);
			await transaction.rollback();
			throw new HttpException(error.message, error.status);
		}
	}

	async createAccountProvider(data: SignInProviderDto, providerType: ProviderTypeEnum, transaction: Transaction) {
		const sellerAccount = await this.sellerService.createSellerAccountProvider(data, transaction);

		const userAccount = await this.userService.createUserAccountProvider(
			data,
			sellerAccount.id,
			providerType,
			transaction
		);
		const [newRole] = await Promise.all([
			this.roleService.createSellerAdminRole(sellerAccount.id, transaction),
			this.sellerGeneralSettingService.createGeneralSetting(sellerAccount.id, transaction),
			this.categoryService.createCategoryForSellerByCatalogId(data.catalog_id, sellerAccount.id, transaction),
			this.warehouseService.createCentralWarehouse(sellerAccount.id, data, transaction),
			this.servicePackageService.createServicePackageFreeTrialFromSignUp(
				sellerAccount.id,
				userAccount.id,
				transaction
			)
		]);
		const userRole = await this.roleService.createUserRole(userAccount.id, newRole.id, transaction);
		userRole.role = newRole;
		userAccount.userRole = userRole;
		userAccount.seller = sellerAccount;

		await this.categoryService.updateCategoryFromRootIdPathForNewSeller(sellerAccount.id);
		return userAccount;
	}

	async getSignInDataResponse(user: User) {
		const isAdmin = isAdminByRoleCode(user.userRole.role.role_code);
		const isSpecialAdmin = isSpecialAdminByRoleCode(user.userRole.role.role_code);

		const dataToken: IUserAuth = {
			userId: user.id,
			roleCode: convertUserRoleCodeIntoUUID(user.userRole.role.role_code),
			roleId: user.userRole.role.id,
			sellerId: user.seller_id
		};
		const [functsResult, warehouseIdsList, generalSettings, generateToken, catalogs] = await Promise.all([
			this.functService.getAllFuncts({ ...dataToken, roleCode: user.userRole.role.role_code }, true), // Lấy danh sách menu
			this.warehouseService.getWarehouseIdsListByUserId(user.id, user.seller_id, isAdmin), // Lấy danh sách các cửa hàng, kho của user
			this.sellerGeneralSettingService.getGeneralSettingList(user.seller_id), // lấy thông tin thiết lập chung
			this.generateToken(dataToken), // gen token
			isSpecialAdmin
				? parseDataSqlizeResponse(await this.catalogService.getAllCatalogsList()) //Lấy danh sách ngành hàng
				: this.catalogService.getCatalogsBySellerId(user.seller.id),
			this.servicePackageService.getCurrentServicePackageBySellerId(user.seller_id) //Kiểm tra tính hợp lệ của gói dịch vu
		]);

		const { encodedString, originalString } = generateToken;
		const token = this.jwtService.sign({ uuid: originalString || 'invalid' });

		await Promise.all([
			this.appendTokenToCachingByUserId(user.id, token),
			this.saveIntoCache(user, functsResult.apiMenu)
		]);

		return { token, functsResult, warehouseIdsList, generalSettings, catalogs, encodedString };
	}

	async saveIntoCache(user: User, apiMenu: IApiMenu[]): Promise<void> {
		const cacheKey = cachingKey.hashUser(user.id);
		await this.cachingService.hashSet(cacheKey, hashCachingKey.user.apiMenu, JSON.stringify(apiMenu));
	}

	validate(inputPassword, userPassword, userSalt) {
		if (!userPassword || !userSalt)
			throw new HttpException(messages.auth.accountHasNotPasswordOrSalt, HttpStatus.BAD_REQUEST);
		const cryptography = new Cryptography();
		const hashedInputPassword = cryptography.desaltHashPassword(inputPassword, userSalt);
		if (hashedInputPassword !== userPassword) {
			throw new HttpException(messages.auth.wrongPassword, HttpStatus.UNAUTHORIZED);
		}
	}

	async accountValidation(email: string, type: UserAccountStatusActionTypeEnum): Promise<User | null> {
		const userAccount = await this.UserModel.findOne({
			where: { email },
			raw: true
		});
		if (!userAccount) {
			throw new HttpException(messages.auth.userNotFound, 404);
		}

		if (type === UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT) {
			if (userAccount.has_activated) {
				throw new HttpException(messages.auth.accountHasBeenActivated, HttpStatus.BAD_REQUEST);
			}
		}

		if (type === UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT) {
			if (!userAccount.has_activated) {
				throw new HttpException(messages.auth.accountHasNotBeenActivated, HttpStatus.BAD_REQUEST);
			}
		}

		if (!userAccount.status) {
			throw new HttpException(messages.auth.statusDisable, HttpStatus.UNAUTHORIZED);
		}

		return userAccount;
	}

	async accountProviderValidation(
		email: string,
		providerType: ProviderTypeEnum,
		providerId: string
	): Promise<User | null> {
		const userAccount = await this.UserModel.findOne({
			where: { email },
			include: [
				{
					model: UserRole,
					as: 'userRole',
					include: [Role]
				},
				{
					model: Seller
				}
			],
			raw: false
		});

		if (!userAccount) return null;

		if (!userAccount.status) {
			throw new HttpException(messages.auth.statusDisable, HttpStatus.UNAUTHORIZED);
		}

		const userTokenValidation = await this.UserTokenModel.findOne({
			where: {
				user_id: userAccount.id,
				type: providerType
			}
		});

		if (!userTokenValidation) {
			await this.UserTokenModel.create({
				user_id: userAccount.id,
				type: providerType,
				provider_id: providerId
			});
		} else if (userTokenValidation.provider_id !== providerId) {
			throw new HttpException(messages.auth.signinProviderError, HttpStatus.BAD_REQUEST);
		}

		return parseDataSqlizeResponse(userAccount);
	}

	async signInResponse(user: User): Promise<SigninResponseDto> {
		const [{ token, encodedString, functsResult, warehouseIdsList, generalSettings, catalogs }] = await Promise.all(
			[this.getSignInDataResponse(user), this.userService.updateUserLastLogin(user.id)]
		);

		return {
			token,
			fullName: user.fullname,
			avatar: user.avatar || null,
			phone: user.phone || null,
			user_type: getKeyByValue(UserTypeEnum, user.user_type),
			email: user.email,
			uuid: encodedString,
			features: functsResult.features,
			actions: functsResult.actions,
			menu: functsResult.data,
			flatMenu: functsResult.flatMenu,
			warehouseIdsList,
			generalSettings,
			catalogs
		};
	}

	generateToken(dataToken: IUserAuth): IEncodeUserAuthResponse {
		const { userId, roleId, roleCode, sellerId } = dataToken;
		return encodeUserAuthentication(userId, roleCode, roleId, sellerId);
	}

	async createTokenAndSendMail(user: User, type: UserAccountStatusActionTypeEnum, transaction = null) {
		if (type !== UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT) {
			await this.userService.removeUserTokenByUserId(user.id, type, transaction);
		}
		const userToken = await this.userService.createUserToken(user.id, type, transaction);
		const { secret_key, access_token } = userToken;
		const userEmailData: IUserActivateEmail = {
			fullname: user.fullname,
			email: user.email,
			url: ''
		};
		switch (type) {
			case UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT: {
				userEmailData.url = `${urlConfig.api}api/v1/auth/activate-account?secret_key=${secret_key}&access_token=${access_token}&type=${type}`;
				return this.AMQPsendUserActivateSignUpAccount(userEmailData);
			}
			case UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT: {
				userEmailData.url = `${urlConfig.api}api/v1/auth/activate-account?secret_key=${secret_key}&access_token=${access_token}&type=${type}`;
				return this.AMQPsendUserReActivateSignUpAccount(userEmailData);
			}
			case UserAccountStatusActionTypeEnum.RECOVERY_ACCOUNT: {
				userEmailData.url = `${urlConfig.website}recovery-account?secret_key=${secret_key}&access_token=${access_token}`;
				return this.AMQPsendUserRecoveryAccount(userEmailData);
			}
		}
	}    

	async AMQPsendUserActivateSignUpAccount(mailData: IUserActivateEmail) {
		this.amqpService.amqpConnection.publish(
			AMQPExchange.SendEmail,
			AMQPRoutingKey.SendEmailSignUp,
			Buffer.from(JSON.stringify(mailData)),
			{ type: 'topic', persistent: true }
		);
	}
	async AMQPsendUserReActivateSignUpAccount(mailData: IUserActivateEmail) {
		this.amqpService.amqpConnection.publish(
			AMQPExchange.SendEmail,
			AMQPRoutingKey.SendEmailReactivate,
			Buffer.from(JSON.stringify(mailData)),
			{ type: 'topic', persistent: true }
		);
	}
	async AMQPsendUserRecoveryAccount(mailData: IUserActivateEmail) {
		this.amqpService.amqpConnection.publish(
			AMQPExchange.SendEmail,
			AMQPRoutingKey.SendEmailRecoveryAccount,
			Buffer.from(JSON.stringify(mailData)),
			{ type: 'topic', persistent: true }
		);
	}

	async appendTokenToCachingByUserId(userId: number, token: string) {
		const userTokenCacheKey = cachingKey.userToken(userId, token);
		await this.cachingService.set(userTokenCacheKey, '1', jwtConfig.expire);
	}

	async signout(req: Request): Promise<void> {
		const authorization = req.headers['authorization'];
		const uuid = req.headers['x-auth-uuid'];
		if (!authorization || !uuid) return;
		const token = authorization.split(' ').filter(Boolean).slice(-1)[0];
		const authUUID = decodeUserAuthentication(uuid as string);
		const splittedAuthUUID = authUUID.split('-');
		const { AUTH_USER_ID_POSITION } = userAuthConfig;
		const userId = Number(splittedAuthUUID[AUTH_USER_ID_POSITION]);
		const userTokenCacheKey = cachingKey.userToken(userId, token);
		await this.cachingService.del(userTokenCacheKey);
	}

	async limitRequestMailServiceByUserIP(userIp: string) {
		const cacheKey = cachingKey.limitRequestByUserIp(userIp);
		await this.cachingService.set(cacheKey, '1', keyTTL.limitRequestByUserIp);
	}

	async checkUserIPHasLimitRequest(userIp: string): Promise<void> {
		const cacheKey = cachingKey.limitRequestByUserIp(userIp);
		const checkKeyExist = await this.cachingService.exist(cacheKey);
		if (checkKeyExist) {
			const ttl = await this.cachingService.ttl(cacheKey);
			throw new HttpException(messages.auth.limitRequestByUserIp(ttl), HttpStatus.BAD_REQUEST);
		}
	}

	async verifyToken({ sellerId }: IUserAuth) {
		await this.servicePackageService.getCurrentServicePackageBySellerId(sellerId);
	}
}
