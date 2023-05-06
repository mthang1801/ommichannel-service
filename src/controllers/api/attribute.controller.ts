import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { AttributeQueryParams } from 'src/dtos/requests/attributes/attributesQueryParams.dto';
import { CreateAttributeDto } from 'src/dtos/requests/attributes/createAttribute.dto';
import { UpdateAttributeDto } from 'src/dtos/requests/attributes/updateAttribute.dto';
import { UpdateAttributeCategoryDto } from 'src/dtos/requests/attributes/updateAttributeCategory.dto';
import { CategoryQueryParamsDto } from 'src/dtos/requests/category/queryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Attribute } from 'src/models/attribute.model';
import { Category } from 'src/models/category.model';
import { AttributeService } from 'src/services/attribute.service';
import { ApiUpdateResponseExtra } from 'src/swagger/apiUpdateResponse.dto';
import { CategoryAttribute } from '../../models/categoryAttribute.model';

@Controller('attributes')
@ApiTags('Bộ thuộc tính')
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
export class AttributeController {
	constructor(private readonly attributeService: AttributeService) {}

	@Post()
	@UseInterceptors(TransactionInterceptor)
	async createAttribute(
		@Req() req: Request,
		@Body() data: CreateAttributeDto,
		@TransactionParam() transaction: Transaction
	): Promise<void> {
		const { sellerId } = req['user'] as IUserAuth;

		const attributePayload = {
			...data,
			seller_id: sellerId
		};
		await this.attributeService.createAttribute(sellerId, attributePayload, transaction);
	}

	@Put(':id')
	@UseInterceptors(TransactionInterceptor)
	async updateAttribute(
		@Param('id') id: number,
		@Req() req: Request,
		@Body() data: UpdateAttributeDto,
		@TransactionParam() transaction: Transaction
	): Promise<any> {
		const { sellerId } = req['user'] as IUserAuth;

		return await this.attributeService.updateAttribute(sellerId, id, data, transaction);
	}

	@Get()
	async getListAttributes(
		@Query() queryParams: AttributeQueryParams,
		@Req() req: Request
	): Promise<ResponseAbstractList<Attribute>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.attributeService.getListAttributes(sellerId, queryParams);
	}

	@Get(':id')
	async getAttributeById(@Param('id') id: number, @Req() req: Request): Promise<Attribute> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.attributeService.getAttributeById(sellerId, id);
	}

	@ApiOperation({ summary: 'lấy danh sách danh mục thuộc features' })
	@Get(':id/categories')
	async getCategoriesList(
		@Query() queryParams: CategoryQueryParamsDto,
		@Param('id') id: number
	): Promise<ResponseAbstractList<any>> {
		return this.attributeService.getCategoriesList(id, queryParams);
	}

	@Put(':id/update-category')
	@ApiOperation({ summary: 'Thêm/ xoá danh mục' })
	@ApiUpdateResponseExtra()
	async updateAttributeCategory(@Param('id') id: number, @Body() data: UpdateAttributeCategoryDto): Promise<void> {
		await this.attributeService.updateAttributeCategory(id, data);
	}
}
