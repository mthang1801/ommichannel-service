import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Param, Put } from '@nestjs/common/decorators';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { CreateCatalogDto } from 'src/dtos/requests/catalog/createCatalog.dto';
import { CatalogQueryParamsDto } from 'src/dtos/requests/catalog/queryParams.dto';
import { UpdateCatalogDto } from 'src/dtos/requests/catalog/updateCatalog.dto';
import { UpdateCatalogIndexDto } from 'src/dtos/requests/catalog/updateCatalogIndex.dto';
import { UpdateCategoryStatusInCatalogDto } from 'src/dtos/requests/catalog/updateCategoryStatusInCatalog.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Catalog } from 'src/models/catalog.model';
import { CatalogService } from 'src/services/catalog.service';
import { ApiCreatedResponseExtra } from 'src/swagger/apiCreatedResponse.dto';
import { ApiOkResponseExtra } from 'src/swagger/apiOkResponse.dto';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';
import { ApiUpdateResponseExtra } from 'src/swagger/apiUpdateResponse.dto';

@Controller('catalogs')
@ApiTags('Ngành hàng')
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
export class CatalogController {
	constructor(private readonly catalogService: CatalogService) {}

	@Post()
	@ApiBody({ type: CreateCatalogDto, description: 'Tạo danh mục ngành hàng' })
	@ApiOperation({ summary: 'Tạo danh mục ngành hàng' })
	@ApiCreatedResponseExtra()
	@ApiBadRequestResponse()
	async createCatalog(@Req() req: Request, @Body() data: CreateCatalogDto): Promise<void> {
		await this.catalogService.createCatalog(data, req['user']);
	}

	@Put('update-indexes')
	@ApiOperation({ summary: 'Cập nhật vị trí ngành hàng' })
	@ApiOkResponseExtra(UpdateCatalogIndexDto)
	async updateCatalogIndex(@Body() data: UpdateCatalogIndexDto): Promise<void> {
		await this.catalogService.updateCatalogIndex(data);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Cập nhật ngành hàng' })
	@ApiBody({ type: UpdateCatalogDto })
	@ApiUpdateResponseExtra()
	async updateCatalog(@Param('id') id: number, @Req() req: Request, @Body() data: UpdateCatalogDto): Promise<void> {
		await this.catalogService.updateCatalog(id, data, req['user'] as IUserAuth);
	}

	@Get()
	@ApiOperation({ summary: 'Lấy danh sách ngành hàng' })
	@ApiPaginatedResponse(Catalog)
	async getCatalogsList(
		@Req() req: Request,
		@Query() queryParams: CatalogQueryParamsDto
	): Promise<ResponseAbstractList<Catalog>> {
		console.log(req)
		return this.catalogService.getCatalogsList(req['user'], queryParams);
	}

	@Get("all")
	@SkipAuth()
	@ApiOperation({ summary: 'Lấy tất cả danh sách ngành hàng đang hoạt động' })
	@ApiPaginatedResponse(Catalog)
	async getAllActiveCatalogsList(
		@Req() req: Request,
		@Query() queryParams: CatalogQueryParamsDto
	): Promise<ResponseAbstractList<Catalog>> {
		console.log(req)
		return this.catalogService.getAllActiveCatalogsList( queryParams);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Lấy ngành hàng theo id' })
	@ApiOkResponseExtra(Catalog)
	async getCatalogById(@Req() req : Request,  @Param('id') id: number): Promise<Catalog> {
		return this.catalogService.getCatalogById(req["user"], id);
	}

	@Put('/category/:id/update-status')
	@ApiOperation({ summary: 'Cập nhật danh mục trong ngành hàng' })
	@ApiUpdateResponseExtra()
	async updateCategoryStatusInCatalog(
		@Param('id') id: number,
		@Body() data: UpdateCategoryStatusInCatalogDto
	): Promise<void> {
		const { status } = data;
		this.catalogService.updateCategoryStatusInCatalog(id, status);
	}
}
