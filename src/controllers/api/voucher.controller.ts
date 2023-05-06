import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { HttpCode } from '@nestjs/common';
import { VoucherService } from 'src/services/voucher.service';
import { CreateVoucherDto } from 'src/dtos/requests/voucher/createVoucher.dto';
import { Voucher } from 'src/models/voucher.model';
import { ApplyValidVoucherDto } from 'src/dtos/requests/voucher/applyValidVoucher.dto';
import { UpdateVoucherDto } from 'src/dtos/requests/voucher/updateVoucher.dto';
import { VoucherPayloadDto } from 'src/dtos/voucherPayload.dto';
import { VoucherQueryParamsDto } from 'src/dtos/requests/voucher/voucherQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';

@Controller('vouchers')
export class VoucherController {
	constructor(private readonly voucherservice: VoucherService) {}

	@Post()
	async createVoucher(@Req() req: Request, @Body() data: CreateVoucherDto): Promise<void | Voucher> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.voucherservice.createVoucher(data, sellerId);
	}

	@HttpCode(200)
	@Post('apply-valid-voucher/:id')
	async applyValidVoucher(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: ApplyValidVoucherDto
	): Promise<{ discount: number }> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.voucherservice.applyValidVoucher(sellerId, id, data);
	}

	@Put(':id')
	async updateSupplier(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateVoucherDto
	): Promise<void | Voucher> {
		const { sellerId } = req['user'] as IUserAuth;

		const voucherPayload: VoucherPayloadDto = {
			...data,
			seller_id: sellerId
		};

		return this.voucherservice.updateVoucher(id, voucherPayload);
	}

	@Get()
	async getVoucherList(
		@Req() req: Request,
		@Query() queryParams: VoucherQueryParamsDto
	): Promise<ResponseAbstractList<Voucher>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.voucherservice.getVoucherList(sellerId, queryParams);
	}

	@Get(':id')
	async getVoucherById(@Param('id') id: number): Promise<Voucher> {
		return this.voucherservice.getVoucherById(id);
	}
}
