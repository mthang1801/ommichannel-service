import { Put } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, Req, UseInterceptors } from '@nestjs/common/decorators';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CreateCategoryDto } from 'src/dtos/requests/category/createCategory.dto';
import { CategoryQueryParamsDto } from 'src/dtos/requests/category/queryParams.dto';
import { UpdateCategoryDto } from 'src/dtos/requests/category/updateCategory.dto';
import { UpdateCategoryAttributeIndexDto } from 'src/dtos/requests/category/updateCategoryAttributeIndex.dto';
import { UpdateCategoryIndexDto } from 'src/dtos/requests/category/updateCategoryIndex';
import { UpdateProductInCategoryDto } from 'src/dtos/requests/category/updateProductInCategory.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Category } from 'src/models/category.model';
import { CategoryService } from 'src/services/category.service';
import { ApiCreatedResponseExtra } from 'src/swagger/apiCreatedResponse.dto';
import { ApiOkResponseExtra } from 'src/swagger/apiOkResponse.dto';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';
import { ApiUpdateResponseExtra } from 'src/swagger/apiUpdateResponse.dto';

@Controller('categories')
@ApiTags('Danh mục')
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
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post()
	@ApiBody({ type: CreateCategoryDto, description: 'Tạo danh mục' })
	@ApiOperation({ summary: 'Tạo danh mục' })
	@ApiCreatedResponseExtra()
	async createCategory(@Req() req: Request, @Body() data: CreateCategoryDto): Promise<Category> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		return await this.categoryService.createCategory(data, sellerId, isSpecialAdmin);
	}

	@Get()
	@ApiQuery({ type: CategoryQueryParamsDto })
	@ApiOperation({ summary: 'Lấy danh sách danh mục' })
	@ApiPaginatedResponse(Category)
	async getCategoryList(
		@Req() req: Request,
		@Query() queryParams: CategoryQueryParamsDto
	): Promise<ResponseAbstractList<Category>> {
		return this.categoryService.getCategoryList(queryParams, req["user"]);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Chi tiết danh mục' })
	@ApiOkResponseExtra(Category)
	async getCategoryById(@Req() req: Request, @Param('id') id: number): Promise<Category> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		return this.categoryService.getCategoryById(id, sellerId, roleCode);
	}

	@Put('update-attribute-index')
	@ApiOperation({ summary: 'Cập nhật attribute index trong danh mục' })
	@ApiUpdateResponseExtra()
	async updateCategoryAttributeIndex(@Body() data: UpdateCategoryAttributeIndexDto): Promise<void> {
		await this.categoryService.updateCategoryAttributeIndex(data);
	}

	@Put('update-indexes')
	@ApiBody({ type: UpdateCategoryIndexDto })
	@ApiOperation({ summary: 'Cập nhật vị trí danh mục' })
	@ApiUpdateResponseExtra()
	async updateCategoryPosition(@Body() data: UpdateCategoryIndexDto): Promise<void> {
		await this.categoryService.updateCategoryIndex(data);
	}

	@Put(':id/update-products')
	@UseInterceptors(TransactionInterceptor)
	@ApiOperation({ summary: 'Cập nhật SP trong danh mục' })
	@ApiUpdateResponseExtra()
	async updateProductInCategory(@Param('id') id: number, @Body() data: UpdateProductInCategoryDto, @Req() req: Request): Promise<void> {
		await this.categoryService.updateProductInCategory(req["user"], id, data);
	}

	@Put(':id')
	@UseInterceptors(TransactionInterceptor)
	@ApiBody({ type: CreateCategoryDto, description: 'Cập nhật danh mục' })
	@ApiOperation({ summary: 'Cập nhật danh mục' })
	@ApiUpdateResponseExtra()
	async updateCategory(
		@Param('id') id: number,
		@Req() req: Request,
		@Body() data: UpdateCategoryDto,
		@TransactionParam() transaction: Transaction
	) {
		await this.categoryService.updateCategory(req['user'], id, data, transaction);
	}
}
