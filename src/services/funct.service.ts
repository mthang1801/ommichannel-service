import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Funct } from 'src/models/funct.model';

import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { FunctCodeSign } from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { isAdminByRoleCode, isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { sequelize } from 'src/configs/db';
import { CreateFunctDto } from 'src/dtos/requests/functs/createFunct.dto';
import { FunctQueryParams } from 'src/dtos/requests/functs/functQueryParams.dto';
import { UpdateFunctDto } from 'src/dtos/requests/functs/updateFunct.dto';
import { UpdateFunctsIndexesDto } from 'src/dtos/requests/functs/updateFunctPosition.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { GetFunctResponse } from 'src/dtos/responses/funct/getFunctResponse.dto';
import { IApiMenu, IFlatMenu, IFunctField } from 'src/interfaces/funct.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Role } from 'src/models/role.model';
import { RoleFunct } from 'src/models/roleFunc.model';
import { UserRole } from 'src/models/userRole.model';
import {
	checkOnlyUpdateStatus,
	filterData,
	getPageOffsetLimit,
	listDataParser,
	parseDataSqlizeResponse,
	typeOf
} from 'src/utils/functions.utils';
import { FIXED_SERVICE_PACKAGE_CODE } from '../common/constants/constant';
import { ServicePackageService } from './servicePackage.service';

@Injectable()
export class FunctService {
	constructor(
		@InjectModel(UserRole) private readonly UserRoleModel: typeof UserRole,
		@InjectModel(Role) private readonly RoleModel: typeof Role,
		@InjectModel(RoleFunct)
		private readonly RoleFunctModel: typeof RoleFunct,
		@InjectModel(Funct) private readonly FunctModel: typeof Funct,
		@Inject(forwardRef(() => ServicePackageService)) private readonly servicePackageService: ServicePackageService
	) {}

	async getAllFuncts({ roleId, roleCode, sellerId }: IUserAuth, nested = true): Promise<GetFunctResponse> {
		const isAdmin = isAdminByRoleCode(roleCode);
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		let functsList = [];

		if (isAdmin) {
			const whereClause: any = { status: true };
			if (!isSpecialAdmin) {
				whereClause.only_admin_view = false;
			}
			functsList = await this.FunctModel.findAll({
				where: whereClause
			});
			functsList = listDataParser<Funct>(functsList);
		} else {
			functsList = (
				await sequelize.query(
					`
				SELECT 
					* 
				FROM
					(SELECT 
					f0.id,
					f0.parent_id,
					f0.method,
					f0.status,					
					f0.api_route,
					f0.ui_route,
					f0.level,
					f0.index,
					f0.ui_icon,
					f0.active_icon,
					f0.funct_name,
					f0.funct_code,
					f0.action,
					f0.relative_funct_ids,
					f0.description ,
					f0.only_admin_view
					FROM
					functs f0 
					LEFT OUTER JOIN functs f1 
						on f1.parent_id = f0.id 
					LEFT OUTER JOIN functs f2 
						on f2.parent_id = f1.id 
					GROUP BY f0.id					
					) as functResult 
					INNER JOIN role_functs as roleFunct 
					ON roleFunct.funct_id = functResult.id 
					AND roleFunct.role_id = ${roleId}
				WHERE status = 1 AND only_admin_view = 0;	
				`,
					{ logging: true }
				)
			)[0];
		}

		const { listActions, listFeatures, apiMenu, flatMenu } = await this.getFeaturesMenuActionsList(functsList);

		if (nested && functsList?.length) {
			functsList = await this.sortFunctsListCascade(functsList, sellerId);
		}

		return {
			data: functsList,
			features: listFeatures,
			actions: listActions,
			flatMenu,
			apiMenu
		};
	}

	getFeaturesMenuActionsList(functsList: Funct[]) {
		const listFeatures = functsList.map((functItem) => functItem.funct_code);
		const flatMenu: IFlatMenu[] = [];
		const apiMenu: IApiMenu[] = [];

		functsList.forEach(
			({
				ui_route,
				status,
				level,
				ui_icon,
				active_icon,
				funct_name,
				funct_code,
				action,
				api_route,
				method,
				mobile_icon,
				mobile_route
			}: IFunctField) => {
				flatMenu.push({
					ui_route,
					status,
					level,
					ui_icon,
					active_icon,
					funct_name,
					funct_code,
					action,
					mobile_icon,
					mobile_route
				});

				if (api_route && method) {
					apiMenu.push({ api_route, method });
				}
			}
		);
		const listActions = functsList.reduce((acc, ele) => {
			if (ele.level === 2) {
				acc.push(ele.funct_code);
			}
			return acc;
		}, []);
		return {
			listFeatures,
			flatMenu,
			apiMenu,
			listActions
		};
	}

	async getFuncts(queryParams: FunctQueryParams): Promise<ResponseAbstractList<Funct>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		const whereClause = FunctQueryParams.getQueryParamsWhereClause(queryParams);

		const functsList = await this.FunctModel.findAll({
			where: whereClause,
			order: [
				['index', 'ASC'],
				['updated_at', 'ASC']
			],
			limit,
			offset
		});

		return {
			paging: {
				currentPage: page,
				pageSize: functsList.length,
				total: functsList.length
			},
			data: functsList
		};
	}

	async sortFunctsListCascade(functsList: Funct[], sellerId: number): Promise<Funct[]> {
		// Lấy gói dịch vụ của seller Id
		const servicePackageBySellerId = await this.servicePackageService.getCurrentServicePackageBySellerId(sellerId);
		if (servicePackageBySellerId?.service_package?.service_code === FIXED_SERVICE_PACKAGE_CODE.BASIC) {
			functsList = functsList.filter((functItem) => functItem.funct_code !== 'MODULES_CONFIG__PLATFORM');
		}

		return _.orderBy(
			_.orderBy(functsList, 'level', 'desc').reduce((res, item: any) => {
				const functsChildren = _.orderBy(
					res.filter((functItem) => functItem.parent_id === item.id),
					'index',
					'asc'
				);

				if (functsChildren.length) {
					item['children'] = functsChildren;
					functsChildren.forEach((functChild) => {
						const resIndex = res.findIndex((resItem) => resItem.id === functChild.id);
						res.splice(resIndex, 1);
					});
				}
				res.push(item);
				return res;
			}, [] as Funct[]),
			'index',
			'asc'
		).filter((functItem) => functItem.level === 0);
	}

	async createFunctValidation(data: CreateFunctDto): Promise<void> {
		let whereClause: any = {
			funct_code: data.funct_code
		};
		if (data.api_route) {
			const _whereClause: any = {
				[Op.or]: [{ method: data.method, api_route: data.api_route }, { ...whereClause }]
			};
			whereClause = _whereClause;
		}

		const isInvalid = await this.FunctModel.findOne({
			where: whereClause
		});

		if (isInvalid) {
			throw new HttpException(messages.roles.createInvalidFunct, HttpStatus.FORBIDDEN);
		}
	}

	async updateFunctValidation(id: number, data: UpdateFunctDto) {
		let _whereClause: any = {
			[Op.and]: [
				{
					funct_code: data.funct_code
				},
				{
					id: {
						[Op.ne]: id
					}
				}
			]
		};
		if (data.api_route) {
			const whereClause: any = {
				[Op.or]: [
					{
						method: data.method,
						api_route: data.api_route,
						id: {
							[Op.ne]: id
						}
					},
					{ ..._whereClause }
				]
			};
			_whereClause = whereClause;
		}

		const isInvalid = await this.FunctModel.findOne({
			where: _whereClause
		});

		if (isInvalid) {
			throw new HttpException(messages.roles.createInvalidFunct, HttpStatus.BAD_REQUEST);
		}
	}

	async createFunct(data: CreateFunctDto): Promise<void> {
		await this.createFunctValidation(data);

		let level = 0;
		let position = 1;
		if (data.parent_id) {
			const parentFunct = await this.FunctModel.findByPk(data.parent_id);
			if (!parentFunct) {
				throw new HttpException('Không tìm thấy Parent Funct.', 400);
			}
			this.createFunctWithParentValidation(data.funct_code, parentFunct.level);
			level = parentFunct.level + 1;
		}

		if (!data.index) {
			const lastUIPosition = await this.FunctModel.findOne({
				where: { parent_id: data.parent_id },
				order: [['index', 'DESC']]
			});
			if (lastUIPosition) {
				position = lastUIPosition.index + 1;
			}
		}

		const functPayload = {
			...data,
			relative_funct_ids:
				typeOf(data?.relative_funct_ids) === 'array'
					? data?.relative_funct_ids?.join(',')
					: data?.relative_funct_ids || null,
			funct_code: data.funct_code.toUpperCase(),
			level,
			index: position
		};

		const newFunct = await this.FunctModel.create(functPayload);
		newFunct.index = newFunct.id;
		await newFunct.save();
	}

	createFunctWithParentValidation(functCode: string, parentLevel: number): boolean {
		const functCodeSignLength = functCode.split(FunctCodeSign).length;
		if ((parentLevel === 0 && functCodeSignLength === 2) || (parentLevel === 1 && functCodeSignLength === 3))
			return true;
		throw new HttpException(messages.functiontAndModule.invalidFunctCode, HttpStatus.BAD_REQUEST);
	}

	async updateIndexes(data: UpdateFunctsIndexesDto): Promise<void> {
		await Promise.all(
			data.funct_indexes.map(async (dataItem) => {
				this.FunctModel.update({ index: dataItem.index }, { where: { id: dataItem.id } });
			})
		);
	}

	async updateFunct(id: number, data: UpdateFunctDto): Promise<void> {
		const payloadData = filterData<UpdateFunctDto>(data);
		console.log(payloadData);
		if (checkOnlyUpdateStatus(payloadData)) {
			await this.FunctModel.update(payloadData, { where: { id } });
			return;
		}
		await this.updateFunctValidation(id, data);

		let level = data?.level;
		let position = data?.index;

		if (data.parent_id) {
			const parentFunct = await this.FunctModel.findByPk(data.parent_id);

			if (!parentFunct) {
				throw new HttpException('Không tìm thấy Parent Funct.', 400);
			}

			level = parentFunct.level + 1;

			if (data.index === undefined) {
				const lastUIPosition = await this.FunctModel.findOne({
					where: { parent_id: data.parent_id },
					order: [['index', 'DESC']]
				});

				if (lastUIPosition) {
					position = lastUIPosition.index + 1;
				}
			}
		} else {
			level = 0;
			if (data.index === undefined) {
				const lastRootFunct = await this.FunctModel.findOne({
					where: { level: 0 },
					order: [['index', 'DESC']]
				});
				position = lastRootFunct.index + 1;
			}
		}

		const functPayload: any = {
			...data,
			relative_funct_ids:
				typeOf(payloadData?.relative_funct_ids) === 'array'
					? payloadData?.relative_funct_ids?.join(',')
					: payloadData?.relative_funct_ids || null,
			index: position,
			level
		};

		let isEffectedActions = false;
		if (data.funct_code) {
			isEffectedActions = await this.hasEffectActionsFunctCode(id, data.funct_code);
		}
		await this.updateFunctValidation(id, functPayload);

		await this.FunctModel.update(functPayload as Funct, {
			where: { id }
		});

		if (isEffectedActions) {
			let functsChildren: any[] = [];
			if (level === 0) {
				functsChildren = await this.FunctModel.findAll({
					where: { parent_id: id }
				});
				if (functsChildren.length) {
					await Promise.all(
						functsChildren.map(async (functChild) => {
							const currentFunctCode = functChild.funct_code.split(FunctCodeSign).slice(-1)[0];
							const newChilFunctCode = data.funct_code + FunctCodeSign + currentFunctCode;
							await this.FunctModel.update(
								{ funct_code: newChilFunctCode },
								{ where: { id: functChild.id } }
							);
							const actions = await this.FunctModel.findAll({
								where: { parent_id: functChild.id }
							});
							if (actions.length) {
								await Promise.all(
									actions.map(async (action) => {
										const currentAction = action.funct_code.split(FunctCodeSign).slice(-1)[0];
										const newFunctCode = newChilFunctCode + FunctCodeSign + currentAction;
										await this.FunctModel.update(
											{ funct_code: newFunctCode },
											{ where: { id: action.id } }
										);
									})
								);
							}
						})
					);
				}
			}
			if (level === 1) {
				const actions = await this.FunctModel.findAll({
					where: { parent_id: id }
				});
				if (actions.length) {
					await Promise.all(
						actions.map(async (action) => {
							const currentAction = action.funct_code.split(FunctCodeSign).slice(-1)[0];
							const newFunctCode = data.funct_code + FunctCodeSign + currentAction;
							await this.FunctModel.update({ funct_code: newFunctCode }, { where: { id: action.id } });
						})
					);
				}
			}
		}
	}

	async hasEffectActionsFunctCode(id: number, funct_code: string): Promise<boolean> {
		const oldFunct = await this.FunctModel.findByPk(id);
		if (!oldFunct) {
			throw new HttpException(messages.roles.notFoundItem, HttpStatus.NOT_FOUND);
		}
		return !(oldFunct.funct_code === funct_code);
	}

	async getFunctById(id: number) {
		const funct = await this.FunctModel.findOne({
			where: { id }
		});

		if (!funct) {
			throw new HttpException(messages.roles.notFoundItem, HttpStatus.NOT_FOUND);
		}
		return funct;
	}

	async getFunctsChildren(id: number, queryParams: FunctQueryParams): Promise<ResponseAbstractList<Funct>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		const whereClause = FunctQueryParams.getQueryParamsWhereClause(
			{
				...queryParams,
				parent_id: id
			},
			true
		);

		const { rows, count } = await this.FunctModel.findAndCountAll({
			where: whereClause,
			order: [['index', 'ASC']],
			offset,
			limit
		});

		const functsChildrenRows: Funct[] = parseDataSqlizeResponse(rows);
		const functChildrenResult: Funct[] = [];

		await Promise.all(
			functsChildrenRows.map(async (functChild) => {
				const functGrandChildrend = await this.FunctModel.findAll({
					where: { parent_id: functChild.id },
					order: [['index', 'ASC']]
				});
				functChild['children'] = functGrandChildrend;
				functChildrenResult.push(functChild);
			})
		);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: functChildrenResult.sort((a, b) => a.index - b.index)
		};
	}
}
