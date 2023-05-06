import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op, Transaction } from 'sequelize';
import { UserRoleCodeEnum, UserRoleEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { isAdminByRoleCode, isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { cachingKey } from 'src/configs/caching';
import { CreateRolesDto } from 'src/dtos/requests/roles/createRole.dto';
import { RoleQueryParamsDto } from 'src/dtos/requests/roles/roleQueryParams.dto';
import { UpdateRoleGroupDto } from 'src/dtos/requests/roles/updateRole.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IRoleFunctPayload } from 'src/interfaces/roleFunctPayload.interface';
import { ICreateRolePayload, IUpdateRolePayload } from 'src/interfaces/rolePayload';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CachingService } from 'src/microservices/caching/caching.service';
import { Funct } from 'src/models/funct.model';
import { Role } from 'src/models/role.model';
import { RoleFunct } from 'src/models/roleFunc.model';
import { UserRole } from 'src/models/userRole.model';
import {
	checkOnlyUpdateStatus,
	convertToPrimitiveChain,
	geneUniqueKey,
	getPageOffsetLimit,
	listDataParser,
	returnListWithPaging
} from 'src/utils/functions.utils';
import { filterData } from '../utils/functions.utils';

@Injectable()
export class RoleService {
	constructor(
		@InjectModel(Role) private readonly RoleModel: typeof Role,
		@InjectModel(RoleFunct)
		private readonly RoleFunctModel: typeof RoleFunct,
		@InjectModel(Funct) private readonly FunctModel: typeof Funct,
		@InjectModel(UserRole) private readonly UserRoleModel: typeof UserRole,
		private readonly cachingService: CachingService
	) {}

	async createUserRole(user_id: number, role_id: number, transaction): Promise<UserRole> {
		const userRolePayload = {
			user_id,
			role_id
		};

		return this.UserRoleModel.create(userRolePayload, { transaction });
	}

	async createSellerAdminRole(seller_id: number, transaction): Promise<Role> {
		const roleName = UserRoleEnum.SellerAdmin;
		const roleCode = UserRoleCodeEnum.SellerAdmin;
		const rolePayload = {
			role_name: roleName,
			role_code: roleCode,
			seller_id
		};
		return await this.RoleModel.create(rolePayload, { transaction });
	}

	async roleCodeValidation(roleCode: string, seller_id: number, role_id: number = null): Promise<void> {
		if (Object.values(UserRoleCodeEnum).includes(roleCode as UserRoleCodeEnum)) {
			throw new HttpException(messages.roles.invalidRole, HttpStatus.BAD_REQUEST);
		}

		const whereClause: any = {
			seller_id,
			role_code: roleCode
		};

		if (role_id) {
			whereClause.id = {
				[Op.ne]: role_id
			};
		}

		const roleCodeExist = await this.RoleModel.findOne({
			where: whereClause
		});

		if (roleCodeExist) {
			throw new HttpException(messages.roles.codeDuplicate, HttpStatus.BAD_REQUEST);
		}
	}

	async roleFunctsValidation(roleId: number, funct_ids: number[], roleCode: string): Promise<void> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		if (isSpecialAdmin) return;
		const roleFunctsRes = (
			await this.RoleModel.findByPk(roleId, {
				include: [
					{
						model: Funct,
						required: false
					}
				]
			})
		).toJSON();

		const functsList = roleFunctsRes.functs;

		if (functsList.length) {
			const functsId = functsList.map((item) => item.id);
			const redundantRoles = _.difference(funct_ids, functsId);

			if (redundantRoles) {
				throw new HttpException(messages.roles.roleError, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async checkUpdateByRoleLevelValidation(currentRoleId: number, targetRoleId: number) {
		const roles = await this.RoleModel.findAll({
			where: { id: { [Op.in]: [currentRoleId, targetRoleId] } }
		});

		const currentRole = roles.find((role) => role.id === currentRoleId);
		const targetRole = roles.find((role) => role.id === targetRoleId);

		if (currentRole.level >= targetRole.level || currentRole.seller_id !== targetRole.seller_id) {
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		}
	}

	async createRole(data: CreateRolesDto, user: IUserAuth, transaction: Transaction): Promise<void> {
		const { role_name, funct_ids } = data;
		const { userId, sellerId, roleCode, roleId } = user;

		let genRoleCode = convertToPrimitiveChain(role_name);
		if (isAdminByRoleCode(genRoleCode)) {
			genRoleCode = `${genRoleCode}_${geneUniqueKey()}`;
		}
		await this.roleCodeValidation(genRoleCode, sellerId, roleId);

		const isAdmin: boolean = isSpecialAdminByRoleCode(roleCode);

		let roleFunct = null;

		if (!isAdmin) {
			roleFunct = await this.roleFunctsValidation(roleId, funct_ids, roleCode);
		}

		const rolePayload: ICreateRolePayload = {
			parent_id: roleFunct?.id || roleId,
			level: roleFunct ? roleFunct.level + 1 : 1,
			role_code: genRoleCode,
			role_name,
			status: data.status,
			seller_id: sellerId,
			created_by: userId,
			updated_by: userId
		};

		const createdRole = await this.RoleModel.create(rolePayload as any, {
			transaction
		});

		if (funct_ids.length) {
			await this.createFunctsByRole(createdRole.id, funct_ids, transaction);
		}
	}

	async getRelativeFunctIdsList(functIds: number[]): Promise<number[]> {
		const functIdsUnique = [...new Set(functIds)];
		const relativesFuncts = await this.FunctModel.findAll({
			attributes: ['relative_funct_ids'],
			where: { id: { [Op.in]: functIdsUnique } }
		});

		relativesFuncts.forEach(({ relative_funct_ids }) => {
			if (relative_funct_ids) {
				const functIds = relative_funct_ids.split(',').map(Number);
				functIds.forEach((functId: number) => {
					if (!functIdsUnique.includes(functId)) {
						functIdsUnique.push(functId);
					}
				});
			}
		});
		return functIdsUnique;
	}

	async updateRole(data: UpdateRoleGroupDto, id: number, user: IUserAuth, transaction: Transaction): Promise<void> {
		const { role_name, funct_ids, status } = data;
		const { userId, sellerId, roleCode, roleId } = user;
		const currentRole = await this.RoleModel.findByPk(id);
		const payloadData = filterData<UpdateRoleGroupDto>(data);
		if (data.status === false && currentRole.status !== data.status) {
			await this.checkAllowUpdateRoleStatusToFalse(id);
		}

		const rolePayload: IUpdateRolePayload = {
			status,
			updated_by: userId
		};

		if (checkOnlyUpdateStatus(payloadData)) {
			await this.RoleModel.update(rolePayload as any, {
				where: { id },
				transaction
			});
			return;
		}
		let genRoleCode = convertToPrimitiveChain(role_name);
		if (isAdminByRoleCode(genRoleCode)) {
			genRoleCode = `${genRoleCode}_${geneUniqueKey()}`;
		}
		await this.roleCodeValidation(genRoleCode, sellerId, id);

		const isAdmin: boolean = isAdminByRoleCode(roleCode);
		const isSpecialAdmin: boolean = isSpecialAdminByRoleCode(roleCode);

		if (!isSpecialAdmin) {
			if (isAdmin) {
				await this.roleFunctsValidation(roleId, funct_ids, roleCode);
			} else {
				if (roleId === id) throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
				await this.checkUpdateByRoleLevelValidation(roleId, id);
			}
		}

		if (role_name) {
			rolePayload.role_name = role_name;
			rolePayload.role_code = isSpecialAdmin ? undefined : genRoleCode;
		}

		await this.RoleModel.update(rolePayload as any, {
			where: { id },
			transaction
		});

		if (data.funct_ids) {
			const checkHasChangeFuncts = await this.hasChangeFunctsInRole(id, data.funct_ids);
			if (checkHasChangeFuncts) {
				await Promise.all([this.removeRoleFunct(id, transaction), this.removeUserTokenAfterUpdatingRole(id)]);
				if (funct_ids?.length) {
					await this.createFunctsByRole(id, funct_ids, transaction);
				}
			}
		}
	}

	async checkAllowUpdateRoleStatusToFalse(roleId: number) {
		const userRole = await this.UserRoleModel.findOne({ where: { role_id: roleId } });
		if (userRole) throw new HttpException(messages.roles.notAllowUpdateRoleByHasUser, HttpStatus.BAD_REQUEST);
	}

	async hasChangeFunctsInRole(roleId: number, functIds: number[]): Promise<boolean> {
		const currentFuncts = listDataParser<RoleFunct>(
			await this.RoleFunctModel.findAll({ where: { role_id: roleId } })
		).map(({ funct_id }) => funct_id);

		if (currentFuncts.length !== functIds.length || _.difference(functIds, currentFuncts).length) return true;
		return false;
	}

	async removeUserTokenAfterUpdatingRole(roleId: number) {
		const userListByRoleId = listDataParser<UserRole>(
			await this.UserRoleModel.findAll({
				where: { role_id: roleId }
			})
		);

		if (userListByRoleId.length) {
			const cachingKeys = await userListByRoleId.reduce(async (acc: any, { user_id }) => {
				acc = await acc;
				const userTokenKeys = cachingKey.getUserTokenKeys(user_id);
				const keys = await this.cachingService.getAllKeys(userTokenKeys);
				acc = acc.concat(keys);
				return acc;
			}, Promise.resolve([]));
			if (cachingKeys.length) {
				await this.cachingService.del(cachingKeys);
			}
		}
	}

	async createFunctsByRole(roleId, funct_ids: number[], transaction: Transaction): Promise<void> {
		const functIdsUnique = await this.getRelativeFunctIdsList(funct_ids);
		const roleFunctsPayload = functIdsUnique.map((functId) => ({ funct_id: functId, role_id: roleId }));
		await this.createRoleFuncts(roleFunctsPayload as IRoleFunctPayload[], transaction);
	}

	async getRolesList(user: IUserAuth, queryParams: RoleQueryParamsDto): Promise<ResponseAbstractList<Role>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const { roleCode, sellerId } = user;
		const getLevel = await this.RoleModel.findOne({
			where: { role_code: roleCode, seller_id: sellerId }
		});
		if (!getLevel) throw new HttpException(messages.roles.invalidRole, HttpStatus.BAD_REQUEST);

		const whereClause = RoleQueryParamsDto.getWhereClauseQueryParams({
			...queryParams,
			level: getLevel.level,
			seller_id: sellerId
		});

		const { rows, count } = await this.RoleModel.findAndCountAll({
			where: whereClause,
			order: [['updated_at', 'desc']],
			offset,
			limit
		});

		return returnListWithPaging(page, limit, count, rows);
	}

	async createRoleFuncts(payload: IRoleFunctPayload[], transaction) {
		return this.RoleFunctModel.bulkCreate(payload as any, { transaction });
	}

	async removeRoleFunct(roleId: number, transaction: Transaction) {
		return this.RoleFunctModel.destroy({ where: { role_id: roleId }, transaction });
	}

	async getById(id: number) {
		return this.RoleModel.findByPk(id, { include: [Funct] });
	}
}
