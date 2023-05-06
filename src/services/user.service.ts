import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DateTimeManagement, FIXED_SERVICE_PACKAGE_ID } from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { SignInDto } from 'src/dtos/requests/auth/signIn.dto';
import { SignInProviderDto } from 'src/dtos/requests/auth/signInGoogle.dto';

import { ProviderTypeEnum, UserAccountStatusActionTypeEnum } from 'src/common/constants/enum';
import { isSpecialAdminByRoleCode, SPECIAL_ADMIN_SELLER_ID } from 'src/common/guards/auth';
import { UpdateUserProfileDto } from 'src/dtos/requests/user/updateUserProfile.dto';
import { UpdateUserSystemDto } from 'src/dtos/requests/user/updateUserSystem.dto';
import { UserSystemQueryParamsDto } from 'src/dtos/requests/user/userSystemQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAccountUniqueField, IUserSignUpAccount } from 'src/interfaces/user.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Role } from 'src/models/role.model';
import { Seller } from 'src/models/seller.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/userRole.model';
import { UserToken } from 'src/models/userToken.model';
import { Warehouse } from 'src/models/warehouse.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { Cryptography } from 'src/utils/cryptography.utils';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import {
	getAcccessTokenAndSecretKey,
	getPageOffsetLimit,
	parseDataSqlizeResponse,
	returnListWithPaging
} from 'src/utils/functions.utils';
import { CreateUserSystemDto } from '../dtos/requests/user/createUserSystem.dto';
import { ServicePackageService } from './servicePackage.service';
@Injectable()
export class UserService {
	constructor(
		@InjectModel(User)
		private readonly UserModel: typeof User,
		@InjectModel(UserToken)
		private readonly UserTokenModel: typeof UserToken,
		@InjectModel(UserRole)
		private readonly UserRoleModel: typeof UserRole,
		@InjectModel(Role)
		private readonly RoleModel: typeof Role,
		@InjectModel(WarehouseStaff)
		private readonly WarehouseStaffModel: typeof WarehouseStaff,
		@Inject(forwardRef(() => ServicePackageService)) private readonly servicePackageService: ServicePackageService
	) {}

	async createUserAccount(payload: IUserSignUpAccount, transaction = null): Promise<User> {
		const userPayload = {
			fullname: payload.fullname,
			phone: payload.phone,
			email: payload.email,
			seller_id: payload.seller_id
		};

		const cryptography = new Cryptography();

		const { hashedData: hashedPassword, secretKey: salt } = cryptography.saltHashPassword(payload.password);

		userPayload['password'] = hashedPassword;
		userPayload['salt'] = salt;

		const options: any = {
			validate: true,
			raw: true
		};
		if (transaction) {
			options.transaction = transaction;
		}
		const dataResponse = await this.UserModel.create<User>(userPayload, options);

		return dataResponse['dataValues'];
	}

	async checkUserAccountExist(payload: IUserAccountUniqueField): Promise<void> {
		if (payload.phone) {
			const phoneExist = await this.UserModel.findOne({
				where: { phone: payload.phone }
			});
			if (phoneExist) throw new HttpException(messages.auth.phoneSignupExist, HttpStatus.BAD_REQUEST);
		}

		if (payload.email) {
			const emailExist = await this.UserModel.findOne({
				where: { email: payload.email }
			});
			if (emailExist) throw new HttpException(messages.auth.emailSignupExist, HttpStatus.BAD_REQUEST);
		}
	}

	async createUserToken(user_id: number, type: UserAccountStatusActionTypeEnum, transaction): Promise<any> {
		const { accessToken, secretKey } = getAcccessTokenAndSecretKey();
		const payload = {
			user_id,
			type: type,
			secret_key: secretKey,
			access_token: accessToken,
			expired_at: formatMySQLTimeStamp(new Date(Date.now() + DateTimeManagement.TOKEN_EXPIRED_IN)),
			created_at: formatMySQLTimeStamp()
		};

		const dataResponse = await this.UserTokenModel.create(payload, {
			validate: true,
			raw: true,
			transaction
		});
		return dataResponse['dataValues'];
	}

	async getUserSignin(data: SignInDto): Promise<User> {
		const userExist = await this.UserModel.findOne({
			where: {
				[Op.or]: [{ phone: data.username }, { email: data.username }]
			},
			include: [
				{
					model: UserRole,
					as: 'userRole',
					include: [Role]
				},
				{
					model: Seller
				}
			]
		});

		this.checkUserAccountStatusValidation(userExist);

		return parseDataSqlizeResponse(userExist);
	}

	checkUserAccountStatusValidation(user: User | null): void {
		if (!user) {
			throw new HttpException('Tài khoản hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
		}

		if (!user.has_activated) {
			throw new HttpException(
				'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt tài khoản.',
				HttpStatus.UNAUTHORIZED
			);
		}

		if (!user.status) {
			throw new HttpException('Tài khoản đã bị vô hiệu hoá, không thể đăng nhập.', HttpStatus.UNAUTHORIZED);
		}
	}

	async tokenValidation(
		access_token: string,
		secret_key: string,
		type: UserAccountStatusActionTypeEnum
	): Promise<UserToken> {
		const userToken = await this.UserTokenModel.findOne({
			where: { access_token, secret_key, type },
			raw: true
		});
		if (!userToken) throw new HttpException('Mã kích hoạt tài khoản không tồn tại', 404);

		if (Date.now() > new Date(userToken.expired_at).getTime()) {
			throw new HttpException('Mã kích hoạt tài khoản đã hết hạn', HttpStatus.UNAUTHORIZED);
		}

		return userToken;
	}

	async updateToActivatedAccount(user_id: number, transaction): Promise<void> {
		await this.UserModel.update({ has_activated: 1 }, { where: { id: user_id }, transaction });
	}

	async removeUserTokenByUserId(user_id: number, type: UserAccountStatusActionTypeEnum, transaction): Promise<void> {
		try {
			if (
				[
					UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT,
					UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT
				].includes(type)
			) {
				await this.UserTokenModel.destroy({
					where: {
						user_id,
						type: {
							[Op.in]: [
								UserAccountStatusActionTypeEnum.ACTIVATE_ACCOUNT,
								UserAccountStatusActionTypeEnum.REACTIVATE_ACCOUNT
							]
						}
					}
				});
				return;
			}
			const userToken = await this.UserTokenModel.findOne({
				where: { user_id, type },
				raw: true
			});

			if (userToken) {
				await this.UserTokenModel.destroy({
					where: { id: userToken.id },
					transaction
				});
			}
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async updateNewPasswordByUserId(user_id: number, password: string, transaction): Promise<void> {
		const cryptography = new Cryptography();

		const { hashedData: hashedPassword, secretKey: salt } = cryptography.saltHashPassword(password);

		const user = await this.UserModel.findOne({ where: { id: user_id } });

		if (!user) throw new HttpException('Không tìm thấy người dùng trong hệ thống.', 404);

		user.password = hashedPassword;
		user.salt = salt;
		await user.save({ transaction });
	}

	async updateUserLastLogin(id: number) {
		return this.UserModel.update({ last_login_at: formatMySQLTimeStamp() }, { where: { id } });
	}

	async createUserAccountProvider(
		data: SignInProviderDto,
		seller_id: number,
		providerType: ProviderTypeEnum,
		transaction
	): Promise<User> {
		const fullName = [data.givenName, data.familyName].filter(Boolean).join(' ').trim();
		const userPayload = {
			seller_id,
			fullname: fullName,
			email: data.email,
			avatar: data.imageUrl,
			has_activated: true,
			phone: data.phone
		};
		const userAccount = await this.UserModel.create(userPayload, {
			transaction,
			raw: true
		});

		const userTokenPayload = {
			user_id: userAccount.id,
			type: providerType,
			provider_id: data.providerId
		};

		await this.UserTokenModel.create(userTokenPayload, { transaction, logging: true });
		return userAccount;
	}

	async findById(id: number): Promise<User> {
		const result = await this.UserModel.findOne({ where: { id } });
		return result;
	}

	async createUserSystem(seller_id, data: CreateUserSystemDto, transaction = null): Promise<User> {
		await this.checkCreateUserSystemValidationBySvcPackage(seller_id);
		const userPayload = {
			seller_id,
			fullname: data.fullname,
			phone: data.phone,
			email: data.email
		};

		const userData = {
			seller_id,
			fullname: data.fullname,
			phone: data.phone,
			email: data.email,
			role_id: data.role_id,
			account_number: data.account_number,
			account_name: data.account_name,
			bank_id: data.bank_id,
			province_id: data.province_id,
			province_name: data.province_name,
			district_id: data.district_id,
			district_name: data.district_name,
			ward_id: data.ward_id,
			ward_name: data.ward_name,
			address: data.address,
			has_activated: true,
			status: data?.status
		};
		await this.checkUserAccountExist(userPayload);

		const cryptography = new Cryptography();

		const { hashedData: hashedPassword, secretKey: salt } = cryptography.saltHashPassword(data.password.trim());

		userData['password'] = hashedPassword;
		userData['salt'] = salt;

		const options: any = {
			validate: true,
			raw: true
		};
		if (transaction) {
			options.transaction = transaction;
		}
		const dataResponse = await this.UserModel.create<User>(userData, options);

		const userRoleData = {
			user_id: dataResponse['dataValues'].id,
			role_id: data.role_id
		};

		await this.UserRoleModel.create(userRoleData);

		if (data?.warehouses?.length) {
			for (const warehouse of data.warehouses) {
				const warehouseData = {
					...warehouse,
					seller_id,
					user_id: dataResponse['dataValues'].id
				};
				await this.WarehouseStaffModel.create(warehouseData);
			}
		}

		return dataResponse['dataValues'];
	}

	async checkCreateUserSystemValidationBySvcPackage(sellerId: number) {
		if (sellerId === SPECIAL_ADMIN_SELLER_ID) return;
		const currentPackageService = await this.servicePackageService.getCurrentServicePackageBySellerId(sellerId);
		if (
			[FIXED_SERVICE_PACKAGE_ID.BASIC, FIXED_SERVICE_PACKAGE_ID.PREMIUM].includes(
				currentPackageService.service_package_id
			)
		) {
			const numberOfUsersBySellerId = await this.UserModel.count({ where: { seller_id: sellerId } });
			if (numberOfUsersBySellerId > currentPackageService.service_package.user_no)
				throw new HttpException(
					messages.servicePackage.createUserLimitedByBasicService,
					HttpStatus.BAD_REQUEST
				);
		}
	}

	async getUserSystemList(
		user: IUserAuth,
		queryParams: UserSystemQueryParamsDto
	): Promise<ResponseAbstractList<User>> {
		const { sellerId, userId } = user;
		const { q, status, created_at_start, created_at_end } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id: sellerId };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					id: {
						[Op.like]: `%${q}%`
					},
					phone: {
						[Op.like]: `%${q}%`
					},
					email: {
						[Op.like]: `%${q}%`
					},
					fullname: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status: status === 'true'
			};
		}
		if (userId) {
			_whereClause = {
				..._whereClause,
				id: { [Op.ne]: userId }
			};
		}
		if (created_at_start && created_at_end) {
			_whereClause = {
				..._whereClause,
				created_at: { [Op.between]: [created_at_start, created_at_end] }
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.UserModel.findAndCountAll({
				where: _whereClause,
				include: [{ model: UserRole, include: [Role] }],
				order: [['updated_at', 'DESC']],
				offset,
				limit,
				distinct: true
			})
		);

		return returnListWithPaging<User>(page, limit, count, rows);
	}

	async getUserSystemListSuperAdmin(
		user: IUserAuth,
		queryParams: UserSystemQueryParamsDto
	): Promise<ResponseAbstractList<User>> {
		const { userId } = user;
		const { q, seller_id, status, created_at_start, created_at_end } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					id: {
						[Op.like]: `%${q}%`
					},
					phone: {
						[Op.like]: `%${q}%`
					},
					email: {
						[Op.like]: `%${q}%`
					},
					fullname: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status: status === 'true'
			};
		}
		if (seller_id) {
			_whereClause = {
				..._whereClause,
				seller_id
			};
		}
		if (userId) {
			_whereClause = {
				..._whereClause,
				id: { [Op.ne]: userId }
			};
		}
		if (created_at_start && created_at_end) {
			_whereClause = {
				..._whereClause,
				created_at: { [Op.between]: [created_at_start, created_at_end] }
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.UserModel.findAndCountAll({
				where: _whereClause,
				include: [Seller],
				order: [['updated_at', 'DESC']],
				offset,
				limit,
				distinct: true
			})
		);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getUserSystemById(seller_id, id): Promise<User> {
		const choosingUser = await this.UserModel.findOne({ where: { id } });
		if (choosingUser.seller_id == seller_id) {
			return this.UserModel.findOne({
				where: { id },
				include: [{ model: UserRole, include: [Role] }]
			});
		}
		return this.UserModel.findOne({
			where: { id },
			include: [Seller]
		});
	}

	async getUserSystemByIdSellerAccount(seller_id, id): Promise<User> {
		return this.UserModel.findOne({
			where: { id },
			include: [
				{ model: UserRole, include: [Role] },
				{ model: WarehouseStaff, include: [Warehouse] }
			]
		});
	}

	async updateUserSystem(user: IUserAuth, id: number, data: UpdateUserSystemDto): Promise<void | User> {
		const { sellerId, userId, roleCode } = user;

		let currentUserSystem;
		if (isSpecialAdminByRoleCode(roleCode)) {
			currentUserSystem = await this.UserModel.findOne({
				where: {
					id: id
				}
			});
		} else {
			currentUserSystem = await this.UserModel.findOne({
				where: {
					id: id,
					seller_id: sellerId
				}
			});
		}

		if (!currentUserSystem) {
			throw new HttpException('Không tồn tại người dùng hệ thống', HttpStatus.NOT_FOUND);
		}

		//User đang được chọn để cập nhật
		const currentUserRole = await this.UserRoleModel.findOne({ where: { user_id: id } });
		const currentRoleLevel = await this.RoleModel.findOne({ where: { id: currentUserRole.role_id } });

		//User đang đăng nhập
		const editUserRole = await this.UserRoleModel.findOne({ where: { user_id: userId } });
		const editRoleLevel = await this.RoleModel.findOne({ where: { id: editUserRole.role_id } });

		if (currentRoleLevel.level <= editRoleLevel.level) {
			throw new HttpException('Không được chỉnh sửa user có level cao hơn hoặc bằng bạn.', HttpStatus.CONFLICT);
		}

		if (data.phone) {
			const checkExistPhone = await this.UserModel.findOne({
				where: { phone: data.phone.trim(), id: { [Op.ne]: id } }
			});
			if (checkExistPhone) {
				throw new HttpException('Số điện thoại đã tồn tại', HttpStatus.CONFLICT);
			}
			data.phone = data.phone.trim();
		}

		if (data.email) {
			const checkExistEmail = await this.UserModel.findOne({
				where: { email: data.email.trim(), id: { [Op.ne]: id } }
			});
			if (checkExistEmail) {
				throw new HttpException('Email đã tồn tại', HttpStatus.CONFLICT);
			}
			data.email = data.email.trim();
		}

		if (data.password) {
			const cryptography = new Cryptography();

			const { hashedData: hashedPassword, secretKey: salt } = cryptography.saltHashPassword(data.password.trim());

			data['password'] = hashedPassword;
			data['salt'] = salt;
		}

		await this.UserModel.update(data, { where: { id } });

		if (data.role_id) {
			await this.UserRoleModel.update({ role_id: data.role_id }, { where: { user_id: id } });
		}

		if (data?.warehouses?.length) {
			for (const warehouse of data.warehouses) {
				const checkExistWarehouseStaff = await this.WarehouseStaffModel.findOne({
					where: { user_id: id, warehouse_id: warehouse.warehouse_id }
				});

				if (!checkExistWarehouseStaff) {
					const warehouseData = {
						...warehouse,
						seller_id: sellerId,
						user_id: id
					};
					await this.WarehouseStaffModel.create(warehouseData);
				} else {
					await this.WarehouseStaffModel.update(
						{ status: warehouse.status },
						{ where: { user_id: id, warehouse_id: warehouse.warehouse_id } }
					);
				}
			}
		}

		return this.UserModel.findOne({ where: { id } });
	}

	async getUserProfileById(userId): Promise<User> {
		return this.UserModel.findOne({
			attributes: { exclude: ['password', 'salt'] },
			where: { id: userId },
			include: [{ model: UserRole, include: [Role] }]
		});
	}

	async updateUserProfile(userId: number, data: UpdateUserProfileDto): Promise<void | User> {
		const currentUserProfile = await this.UserModel.findOne({
			where: {
				id: userId
			}
		});
		if (!currentUserProfile) {
			throw new HttpException('Không tồn tại', HttpStatus.NOT_FOUND);
		}

		// if (data.phone) {
		// 	const checkExistPhone = await this.UserModel.findOne({
		// 		where: { phone: data.phone.trim(), id: { [Op.ne]: id } }
		// 	});
		// 	if (checkExistPhone) {
		// 		throw new HttpException('Số điện thoại đã tồn tại', HttpStatus.CONFLICT);
		// 	}
		// 	data.phone = data.phone.trim();
		// }

		// if (data.email) {
		// 	const checkExistEmail = await this.UserModel.findOne({
		// 		where: { email: data.email.trim(), id: { [Op.ne]: id } }
		// 	});
		// 	if (checkExistEmail) {
		// 		throw new HttpException('Email đã tồn tại', HttpStatus.CONFLICT);
		// 	}
		// 	data.email = data.email.trim();
		// }

		if (data.current_password && data.new_password) {
			if (data.current_password == data.new_password) {
				throw new HttpException('Mật khẩu mới không được trùng với mật khẩu cũ', HttpStatus.CONFLICT);
			}

			this.validate(data.current_password, currentUserProfile.password, currentUserProfile.salt);

			const cryptography = new Cryptography();

			const { hashedData: hashedPassword, secretKey: salt } = cryptography.saltHashPassword(
				data.new_password.trim()
			);

			data['password'] = hashedPassword;
			data['salt'] = salt;
		}

		await this.UserModel.update(data, { where: { id: userId } });

		return this.UserModel.findOne({ where: { id: userId } });
	}

	validate(inputPassword, userPassword, userSalt) {
		const cryptography = new Cryptography();
		const hashedInputPassword = cryptography.desaltHashPassword(inputPassword, userSalt);
		if (hashedInputPassword !== userPassword) {
			throw new HttpException(messages.auth.wrongPassword, HttpStatus.UNAUTHORIZED);
		}
	}
}
