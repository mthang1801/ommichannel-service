import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common/decorators';
import { Request } from 'express';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CreateWarehouseDto } from 'src/dtos/requests/warehouse/createWarehouse.dto';
import { WarehouseQueryParamsDto } from 'src/dtos/requests/warehouse/warehouseQueryParams.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { UpdateWarehouseDto } from 'src/dtos/requests/warehouse/updateWarehouse.dto';
import { Warehouse } from 'src/models/warehouse.model';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { WarehouseService } from 'src/services/warehouse.service';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';

@Controller('warehouses')
@ApiTags('Quản lý kho')
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
export class WarehouseController {
	constructor(private readonly warehouseService: WarehouseService) {}

	@ApiOperation({ summary: 'Lấy danh sách kho' })
	@ApiPaginatedResponse(Warehouse)
	@Get()
	async getWarehouseList(
		@Req() req: Request,
		@Query() queryParams: WarehouseQueryParamsDto
	): Promise<ResponseAbstractList<Warehouse>> {
		const { sellerId } = req['user'];
		return this.warehouseService.getWarehousesList(sellerId, queryParams);
	}

	@ApiOperation({ summary: 'Lấy chi tiết kho' })
	@Get(':id')
	async getWarehouseById(@Req() req: Request, @Param('id') id: number): Promise<any> {
		const { sellerId } = req['user'];
		return this.warehouseService.getWarehouseById(sellerId, id);
	}

	@ApiBody({ type: CreateWarehouseDto })
	@ApiOperation({ summary: 'Tạo kho' })
	@Post()
	@UseInterceptors(TransactionInterceptor)
	async createWarehouse(@Req() req: Request, @Body() data: CreateWarehouseDto): Promise<void | Warehouse> {
		const { sellerId } = req['user'];
		return this.warehouseService.createWarehouse(sellerId, data);
	}

	@ApiBody({ type: UpdateWarehouseDto })
	@ApiOperation({ summary: 'Cập nhật kho' })
	@Put(':id')
	async updateWarehouse(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateWarehouseDto
	): Promise<void | Warehouse> {
		const { sellerId } = req['user'] as IUserAuth;

		return this.warehouseService.updateWarehouse(id, sellerId, data);
	}
}
