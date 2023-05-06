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
import { CodAndCarriageBillService } from 'src/services/codAndCarriageBill.service';
import { CreateCodAndCarriageBillDto } from 'src/dtos/requests/codAndCarriageBill/createCodAndCarriageBill.dto';
import { CodAndCarriageBill } from 'src/models/codAndCarriageBill.model';
import { UpdateCodAndCarriageBillDto } from 'src/dtos/requests/codAndCarriageBill/updateCodAndCarriageBill.dto';
import { CodAndCarriageBillQueryParamsDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillQueryParams.dto';
import { CodAndCarriageBillOverviewDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillOverviewQueryParam.dto';
import { CodAndCarriageBillOverviewResponseDto } from 'src/dtos/responses/codAndCarriageBill/codAndCarriageBillOverview.dto';
import { ApiBearerAuth, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('cod-and-carriage-bills')
@ApiTags('COD và cước phí')
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
export class CodAndCarriageBillController {
	constructor(private readonly codAndCarriageBillService: CodAndCarriageBillService) {}

	@Get()
	async getCodAndCarriageBillList(
		@Req() req: Request,
		@Query() queryParams: CodAndCarriageBillQueryParamsDto
	): Promise<ResponseAbstractList<CodAndCarriageBill>> {
		const { sellerId } = req['user'];
		return this.codAndCarriageBillService.getCodAndCarriageBillList(sellerId, queryParams);
	}

	@Get('overview')
	@ApiOperation({ summary: 'Tổng quan đối soát COD' })
	async getOverview(
		@Req() req: Request,
		@Query() queryParams: CodAndCarriageBillOverviewDto
	): Promise<CodAndCarriageBillOverviewResponseDto> {
		return this.codAndCarriageBillService.getOverview(req['user'], queryParams);
	}

	@Get(':id')
	async getCodAndCarriageBillById(@Req() req: Request, @Param('id') id: number): Promise<any> {
		const { sellerId } = req['user'];
		return this.codAndCarriageBillService.getCodAndCarriageBillById(sellerId, id);
	}

	@Post()
	@UseInterceptors(TransactionInterceptor)
	async createCodAndCarriageBill(
		@Req() req: Request,
		@Body() data: CreateCodAndCarriageBillDto
	): Promise<CodAndCarriageBill> {
		return this.codAndCarriageBillService.createCodAndCarriageBill(data, req['user']);
	}

	@Put(':id')
	async updateCodAndCarriageBill(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateCodAndCarriageBillDto
	): Promise<void | Warehouse> {
		return this.codAndCarriageBillService.updateCodAndCarriageBill(id, req['user'], data);
	}
}
