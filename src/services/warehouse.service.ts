import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import {
	CENTRAL_WAREHOUSE_CODE,
	CENTRAL_WAREHOUSE_NAME,
	FIXED_SERVICE_PACKAGE_ID
} from 'src/common/constants/constant';
import messages from 'src/common/constants/messages';
import { SPECIAL_ADMIN_SELLER_ID } from 'src/common/guards/auth';
import { SignInProviderDto } from 'src/dtos/requests/auth/signInGoogle.dto';
import { CreateWarehouseDto } from 'src/dtos/requests/warehouse/createWarehouse.dto';
import { UpdateWarehouseDto } from 'src/dtos/requests/warehouse/updateWarehouse.dto';
import { WarehouseQueryParamsDto } from 'src/dtos/requests/warehouse/warehouseQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { WarehousePayloadDto } from 'src/dtos/warehousePayload.dto';
import { District } from 'src/models/district.model';
import { Product } from 'src/models/product.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Province } from 'src/models/province.model';
import { Role } from 'src/models/role.model';
import { User } from 'src/models/user.model';
import { UserRole } from 'src/models/userRole.model';
import { Ward } from 'src/models/ward.model';
import { Warehouse } from 'src/models/warehouse.model';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { getPageOffsetLimit, parseDataSqlizeResponse } from 'src/utils/functions.utils';
import { SignUpDto } from '../dtos/requests/auth/signup.dto';
import { ServicePackageService } from './servicePackage.service';

@Injectable()
export class WarehouseService {
	constructor(
		@InjectModel(Warehouse)
		private readonly WarehouseModel: typeof Warehouse,
		@InjectModel(ProductInventory)
		private readonly ProductInventoryModel: typeof ProductInventory,
		@InjectModel(WarehouseStaff)
		private readonly WarehouseStaffModel: typeof WarehouseStaff,
		@Inject(forwardRef(() => ServicePackageService)) private readonly servicePackageService: ServicePackageService
	) {}

	async warehouseValidation(sellerId: number, data: WarehousePayloadDto, id: number = null) {
		let _whereClause: any = {
			seller_id: sellerId
		};

		let conditionClause: any = null;
		if (data.phone) {
			if (id) {
				conditionClause = {
					[Op.and]: [{ phone: data.phone }, { id: { [Op.ne]: id } }]
				};
			} else {
				conditionClause = { phone: data.phone };
			}
		}

		if (conditionClause) {
			_whereClause = {
				seller_id: sellerId,
				...conditionClause
			};
		}

		const warehouseExist = await this.WarehouseModel.findOne({
			where: _whereClause
		});

		const warehouseExistCode = await this.WarehouseModel.findOne({
			where: { warehouse_code: data?.warehouse_code }
		});
		if (warehouseExist) {
			throw new HttpException(messages.warehouses.hasExistPhoneOrEmail, HttpStatus.CONFLICT);
		}
		if (warehouseExistCode) {
			throw new HttpException(messages.warehouses.hasCode, HttpStatus.CONFLICT);
		}
	}

	async createWarehouse(sellerId: number, data: CreateWarehouseDto): Promise<void | Warehouse> {
		await this.checkCreateWareHouseValidationByServicePackage(sellerId);

		const checkWarehouseCode = await this.WarehouseModel.findOne({
			where: { warehouse_code: data.warehouse_code }
		});
		if (checkWarehouseCode) {
			throw new HttpException('Trùng mã kho', HttpStatus.CONFLICT);
		}

		const checkWarehousePhone = await this.WarehouseModel.findOne({ where: { phone: data.phone } });
		if (checkWarehousePhone) {
			throw new HttpException('Trùng số điện thoại kho', HttpStatus.CONFLICT);
		}

		const full_address =
			data.address.trim() +
			', ' +
			data.ward_name.trim() +
			', ' +
			data.district_name.trim() +
			', ' +
			data.province_name.trim();

		const payload = {
			...data,
			seller_id: sellerId,
			full_address,
			address: data.address.trim(),
			ward_name: data.ward_name.trim(),
			district_name: data.district_name.trim(),
			province_name: data.province_name.trim()
		};

		await this.warehouseValidation(sellerId, payload);

		const warehouse = await this.WarehouseModel.create(payload as any);

		if (data?.staffs?.length) {
			for (const staff of data.staffs) {
				const staffData = {
					...staff,
					seller_id: sellerId,
					warehouse_id: warehouse.id
				};
				await this.WarehouseStaffModel.create(staffData);
			}
		}

		return warehouse;
	}

	async checkCreateWareHouseValidationByServicePackage(sellerId: number): Promise<void> {
		if (sellerId === SPECIAL_ADMIN_SELLER_ID) return;
		const currentPackageService = await this.servicePackageService.getCurrentServicePackageBySellerId(sellerId);
		if (
			[FIXED_SERVICE_PACKAGE_ID.BASIC, FIXED_SERVICE_PACKAGE_ID.PREMIUM].includes(
				currentPackageService.service_package_id
			)
		) {
			const numberWarehouse = await this.WarehouseModel.count({ where: { seller_id: sellerId } });
			if (currentPackageService?.service_package?.store_no <= numberWarehouse)
				throw new HttpException(
					messages.servicePackage.createWarehouseLimitedByBasicService,
					HttpStatus.BAD_REQUEST
				);
		}
	}

	async createCentralWarehouse(
		sellerId: number,
		data: SignUpDto | SignInProviderDto,
		transaction: Transaction
	): Promise<void> {
		const payloadData = {
			seller_id: sellerId,
			warehouse_code: CENTRAL_WAREHOUSE_CODE(sellerId),
			warehouse_name: CENTRAL_WAREHOUSE_NAME,
			address: data.address,
			province_id: data.province_id,
			province_name: data.province_name,
			district_id: data.district_id,
			district_name: data.district_name,
			ward_id: data.ward_id,
			ward_name: data.ward_name,
			phone: data.phone
		};

		await this.WarehouseModel.create(payloadData, { transaction });
	}

	async updateWarehouse(id: number, sellerId: number, data: UpdateWarehouseDto): Promise<void | Warehouse> {
		const currentWarehouse = await this.WarehouseModel.findOne({
			where: {
				id: id,
				seller_id: sellerId
			}
		});
		if (!currentWarehouse) {
			throw new HttpException('Không tồn tại', HttpStatus.CONFLICT);
		}

		if (data.phone) {
			const checkWarehousePhone = await this.WarehouseModel.findOne({
				where: { phone: data.phone, id: { [Op.ne]: id } }
			});
			if (checkWarehousePhone) {
				throw new HttpException('Trùng số điện thoại kho', HttpStatus.CONFLICT);
			}
		}

		const address = data.address ? data.address : currentWarehouse.address;
		const ward_name = (data.ward_name ? data.ward_name : currentWarehouse.ward_name).trim();
		const district_name = (data.district_name ? data.district_name : currentWarehouse.district_name).trim();
		const province_name = (data.province_name ? data.province_name : currentWarehouse.province_name).trim();

		const full_address = [address, ward_name, district_name, province_name].filter(Boolean).join(', ');

		const payload = {
			...data,
			seller_id: sellerId,
			full_address,
			address,
			ward_name,
			district_name,
			province_name
		};

		await this.WarehouseModel.update(payload, { where: { id } });

		if (data?.staffs?.length) {
			for (const staff of data.staffs) {
				await this.WarehouseStaffModel.update(
					{ status: staff.status },
					{ where: { user_id: staff.user_id, warehouse_id: id } }
				);
			}
		}

		if (data?.more_staffs?.length) {
			for (const staff of data.more_staffs) {
				const staffData = {
					...staff,
					seller_id: sellerId,
					warehouse_id: id
				};
				await this.WarehouseStaffModel.create(staffData);
			}
		}

		return this.WarehouseModel.findOne({ where: { id } });
	}

	async getWarehousesList(
		seller_id: number,
		queryParams: WarehouseQueryParamsDto
	): Promise<ResponseAbstractList<Warehouse>> {
		const { q, qty_in_stock, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					warehouse_code: {
						[Op.like]: `%${q}%`
					},
					warehouse_name: {
						[Op.like]: `%${q}%`
					},
					full_address: {
						[Op.like]: `%${q}%`
					},
					phone: {
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
		if (qty_in_stock) {
			_whereClause = {
				..._whereClause,
				qty_in_stock: { [Op.gte]: qty_in_stock }
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.WarehouseModel.findAndCountAll({
				where: _whereClause,
				include: [
					{ model: Province },
					{ model: District },
					{ model: Ward },
					{
						model: WarehouseStaff,
						include: [{ model: User, include: [{ model: UserRole, include: [Role] }] }]
					}
				],
				order: [['updated_at', 'DESC']],
				limit,
				distinct: true,
				offset
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

	async getWarehouseById(seller_id, id): Promise<Warehouse | any> {
		const warehouse = await this.WarehouseModel.findOne({
			where: { seller_id, id },
			include: [
				{ model: Province },
				{ model: District },
				{ model: Ward },
				{
					model: WarehouseStaff,
					include: [{ model: User, include: [{ model: UserRole, include: [Role] }] }]
				}
			],
			order: [['updated_at', 'DESC']]
		});

		const productInventoryList = parseDataSqlizeResponse(
			await this.ProductInventoryModel.findAll({
				where: { warehouse_id: id },
				include: [Warehouse, Product]
			})
		);

		return {
			warehouse,
			product_inventory: productInventoryList
		};
	}

	async getWarehouseIdsListByUserId(userId: number, sellerId: number, isAdmin: boolean): Promise<number[]> {
		if (isAdmin) {
			return [
				...new Set(
					parseDataSqlizeResponse(
						await this.WarehouseStaffModel.findAll({
							attributes: ['warehouse_id'],
							where: { seller_id: sellerId }
						})
					).map(({ warehouse_id }) => Number(warehouse_id))
				)
			] as number[];
		}
		return [
			...new Set(
				parseDataSqlizeResponse(
					await this.WarehouseStaffModel.findAll({ attributes: ['warehouse_id'], where: { user_id: userId } })
				).map(({ warehouse_id }) => Number(warehouse_id))
			)
		] as number[];
	}
}
