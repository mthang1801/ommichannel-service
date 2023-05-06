import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse, getPageOffsetLimit } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { SupplierQueryParamsDto } from 'src/dtos/requests/supplier/supplierQueryParams.dto';
import { Voucher } from 'src/models/voucher.model';
import { CreateVoucherDto } from 'src/dtos/requests/voucher/createVoucher.dto';
import { VoucherPayloadDto } from 'src/dtos/voucherPayload.dto';
import { ApplyValidVoucherDto } from 'src/dtos/requests/voucher/applyValidVoucher.dto';
import { VoucherTypeEnum } from 'src/common/constants/enum';
import { VoucherQueryParamsDto } from 'src/dtos/requests/voucher/voucherQueryParams.dto';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';

@Injectable()
export class VoucherService {
	constructor(@InjectModel(Voucher) private readonly VoucherModel: typeof Voucher) {}

	async createVoucher(data: CreateVoucherDto, seller_id: number): Promise<void | Voucher> {
		const check = await this.VoucherModel.findOne({
			where: { seller_id, voucher_code: data.voucher_code }
		});

		if (check) {
			throw new HttpException('Mã giảm giá đã tồn tại', HttpStatus.CONFLICT);
		}
		const payload = {
			...data,
			seller_id
		};

		return this.VoucherModel.create(payload as any);
	}

	async updateVoucher(id: number, payload: VoucherPayloadDto): Promise<void | Voucher> {
		const check = await this.VoucherModel.findOne({ where: { id } });

		if (!check) {
			throw new HttpException('Không tìm thấy', HttpStatus.NOT_FOUND);
		}

		await this.VoucherModel.update(payload, { where: { id } });

		return this.VoucherModel.findOne({ where: { id } });
	}

	async getVoucherList(seller_id, queryParams: VoucherQueryParamsDto): Promise<ResponseAbstractList<Voucher>> {
		const { q } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id, status: 1 };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					voucher_name: {
						[Op.like]: `%${q}%`
					},
					voucher_code: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		_whereClause = {
			..._whereClause,
			status: true
		};

		const now = formatMySQLTimeStamp();
		_whereClause = {
			..._whereClause,
			start_at: { [Op.lte]: now }
		};
		_whereClause = {
			..._whereClause,
			stop_at: { [Op.gte]: now }
		};

		const { rows, count } = parseDataSqlizeResponse(
			await this.VoucherModel.findAndCountAll({
				where: _whereClause,
				order: [['updated_at', 'DESC']],
				limit,
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

	async getVoucherById(id): Promise<Voucher> {
		return this.VoucherModel.findOne({
			where: { id }
		});
	}

	async applyValidVoucher(seller_id, id, data: ApplyValidVoucherDto): Promise<{ discount: number }> {
		const currentVoucher = await this.VoucherModel.findOne({
			where: { seller_id, id }
		});

		if (!currentVoucher) {
			throw new HttpException('Không tìm thấy voucher', HttpStatus.NOT_FOUND);
		}

		if (data.total_price < currentVoucher.min_order_value) {
			throw new HttpException(
				`Đơn hàng chưa đạt giá trị tối thiểu ${currentVoucher.min_order_value}đ`,
				HttpStatus.CONFLICT
			);
		}

		let discount = 0;

		switch (currentVoucher.type) {
			case VoucherTypeEnum['Giảm theo số tiền']:
				discount = currentVoucher.discount;
				break;
			case VoucherTypeEnum['Giảm theo %']:
				discount = (data.total_price * currentVoucher.discount) / 100;
				break;
		}

		if (currentVoucher.max_discount) {
			if (discount > currentVoucher.max_discount) {
				discount = currentVoucher.max_discount;
			}
		}		
		return { discount };
	}
}
