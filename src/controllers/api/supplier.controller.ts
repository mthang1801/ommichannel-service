import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CreateSupplierDto } from 'src/dtos/requests/supplier/createSupplier.dto';
import { SupplierQueryParamsDto } from 'src/dtos/requests/supplier/supplierQueryParams.dto';
import { UpdateSupplierDto } from 'src/dtos/requests/supplier/updateSupplier.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { SupplierPayloadDto } from 'src/dtos/supplierPayload.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Supplier } from 'src/models/supplier.model';
import { SupplierService } from 'src/services/supplier.service';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';

@Controller('suppliers')
@ApiTags('Nhà cung cấp')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		description: 'Access Token',
		example: 'accessToken',
		required: true
	},
	{
		name: 'x-auth-uuid',
		example: 'xAuthUUID',
		required: true
	},
	{
		name: 'Content-Type',
		example: 'application/json'
	}
])
export class SupplierController {
	constructor(private readonly supplierService: SupplierService) {}

	@ApiBody({ type: CreateSupplierDto })
	@ApiOperation({ summary: 'Tạo nhà cung cấp' })
	@Post()
	async createSupplier(@Req() req: Request, @Body() data: CreateSupplierDto): Promise<void> {
		const { sellerId } = req['user'] as IUserAuth;
		await this.supplierService.createSupplier(data, sellerId);
	}

	@ApiBody({ type: UpdateSupplierDto })
	@ApiOperation({ summary: 'Cập nhật nhà cung cấp' })
	@Put(':id')
	async updateSupplier(@Req() req: Request, @Param('id') id: number, @Body() data: UpdateSupplierDto): Promise<void> {
		const { sellerId } = req['user'] as IUserAuth;

		await this.supplierService.updateSupplier(sellerId, id, data);
	}

	@ApiOperation({ summary: 'Lấy danh sách nhà cung cấp' })
	@ApiPaginatedResponse(Supplier)
	@Get()
	async getSupplierList(
		@Req() req: Request,
		@Query() queryParams: SupplierQueryParamsDto
	): Promise<ResponseAbstractList<Supplier>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.supplierService.getSupplierList(sellerId, queryParams);
	}

	@ApiOperation({ summary: 'Lấy chi tiết nhà cung cấp' })
	@Get(':id')
	async getSupplierById(@Param('id') id: number): Promise<Supplier> {
		return this.supplierService.getSupplierById(id);
	}
}
