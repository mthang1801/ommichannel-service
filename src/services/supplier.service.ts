import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from '../dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse, getPageOffsetLimit } from '../utils/functions.utils';
import { Op } from 'sequelize';
import { Supplier } from '../models/supplier.model';
import { Bank } from '../models/bank.model';
import { Province } from '../models/province.model';
import { Ward } from '../models/ward.model';
import { District } from '../models/district.model';
import { SupplierQueryParamsDto } from '../dtos/requests/supplier/supplierQueryParams.dto';
import { CreateSupplierDto } from '../dtos/requests/supplier/createSupplier.dto';
import { SupplierPayloadDto } from '../dtos/supplierPayload.dto';
import { UpdateSupplierDto } from 'src/dtos/requests/supplier/updateSupplier.dto';
import { BankBranch } from 'src/models/bankBranch.model';

@Injectable()
export class SupplierService {
	constructor(@InjectModel(Supplier) private readonly SupplierModel: typeof Supplier) {}

	async createSupplier(data: CreateSupplierDto, sellerId: number): Promise<void | Supplier> {
		if (data.supplier_code) {
			const checkSupplierCode = await this.SupplierModel.findOne({
				where: { supplier_code: data.supplier_code }
			});
			if (checkSupplierCode) {
				throw new HttpException('Trùng mã nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		if (data.phone) {
			const checkPhone = await this.SupplierModel.findOne({
				where: { phone: data.phone }
			});
			if (checkPhone) {
				throw new HttpException('Trùng số điện thoại nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		if (data.email) {
			const checkEmail = await this.SupplierModel.findOne({
				where: { email: data.email }
			});
			if (checkEmail) {
				throw new HttpException('Trùng email nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		if (data.tax_code) {
			const checkTaxCode = await this.SupplierModel.findOne({
				where: { tax_code: data.tax_code }
			});
			if (checkTaxCode) {
				throw new HttpException('Trùng mã số thuế nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		const payload: SupplierPayloadDto = {
			...data,
			seller_id: sellerId
		};

		return this.SupplierModel.create(payload as any);
	}

	async updateSupplier(sellerId: number, id: number, data: UpdateSupplierDto): Promise<any> {
		if (data.phone) {
			const checkPhone = await this.SupplierModel.findOne({
				where: { phone: data.phone, id: { [Op.ne]: id } }
			});
			if (checkPhone) {
				throw new HttpException('Trùng số điện thoại nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		if (data.email) {
			const checkEmail = await this.SupplierModel.findOne({
				where: { email: data.email, id: { [Op.ne]: id } }
			});
			if (checkEmail) {
				throw new HttpException('Trùng email nhà cung cấp', HttpStatus.CONFLICT);
			}
		}

		if (data.tax_code) {
			const checkTaxCode = await this.SupplierModel.findOne({
				where: { tax_code: data.tax_code, id: { [Op.ne]: id } }
			});
			if (checkTaxCode) {
				throw new HttpException('Trùng mã số thuế nhà cung cấp', HttpStatus.CONFLICT);
			}
		}
		await this.SupplierModel.update(data, { where: { id, seller_id: sellerId } });
	}

	async getSupplierList(seller_id, queryParams: SupplierQueryParamsDto): Promise<ResponseAbstractList<Supplier>> {
		const { q, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					supplier_name: {
						[Op.like]: `%${q}%`
					},
					supplier_code: {
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

		const { rows, count } = parseDataSqlizeResponse(
			await this.SupplierModel.findAndCountAll({
				where: _whereClause,
				include: [{ model: Bank }, BankBranch, { model: Province }, { model: District }, { model: Ward }],
				order: [['updated_at', 'DESC']],
				limit,
				offset,
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

	async getSupplierById(id): Promise<Supplier> {
		return this.SupplierModel.findOne({
			where: { id },
			include: [{ model: Bank }, BankBranch, { model: Province }, { model: District }, { model: Ward }]
		});
	}
}
