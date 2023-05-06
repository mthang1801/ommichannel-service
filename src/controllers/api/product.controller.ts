import { Body, Controller, Param, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { Get, Query, UploadedFile } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiForbiddenResponse,
	ApiHeaders,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
	getSchemaPath
} from '@nestjs/swagger';
import { Request } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import { join } from 'path';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { PaginatedDto } from 'src/dtos/page.dto';
import { CreateProductDTO } from 'src/dtos/requests/products/createProduct.dto';
import { ProductLogQueryParamsDto } from 'src/dtos/requests/products/productLogQueryParams.dto';
import { ProductQueryParams } from 'src/dtos/requests/products/productQueryParams.dto';
import { UpdateProductDTO } from 'src/dtos/requests/products/updateProduct.dto';
import { UploadFileDto } from 'src/dtos/requests/upload.request.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { BadRequestResponse } from 'src/dtos/responses/badRequestResponse.dto';
import { ForbiddenSourceDto } from 'src/dtos/responses/ForbidenSource.dto';
import { ProductByIdResponseDto } from 'src/dtos/responses/product/productById.dto';
import { Product } from 'src/models/product.model';
import { ProductLog } from 'src/models/productLog.model';
import { ProductService } from 'src/services/product.service';
import { ApiCreatedResponseExtra } from 'src/swagger/apiCreatedResponse.dto';

@Controller('products')
@ApiTags('Sản phẩm')
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
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@UseInterceptors(TransactionInterceptor)
	@ApiBody({ type: CreateProductDTO, description: 'Create An Product' })
	@ApiOperation({ summary: 'Tạo sản phẩm' })
	@ApiBadRequestResponse({
		type: BadRequestResponse,
		description: 'Dữ liệu truyền vào không hợp lệ.'
	})
	@ApiForbiddenResponse({
		type: ForbiddenSourceDto,
		description: 'Truy cập bị chặn'
	})
	@ApiCreatedResponseExtra()
	async createProduct(@Body() data: CreateProductDTO, @Req() req: Request): Promise<any> {
		await this.productService.createProduct(data, req['user']);
	}

	@Get()
	@ApiForbiddenResponse({
		type: ForbiddenSourceDto,
		description: 'Truy cập bị chặn'
	})
	@ApiOperation({ summary: 'Lấy danh sách SP' })
	@ApiQuery({ type: ProductQueryParams, description: 'Query parameters' })
	@ApiOkResponse({
		schema: {
			allOf: [
				{ $ref: getSchemaPath(PaginatedDto) },
				{
					properties: {
						data: {
							type: 'array',
							items: { $ref: getSchemaPath(Product) }
						}
					}
				}
			]
		}
	})
	async getProductsList(
		@Req() req: Request,
		@Query() queryParams: ProductQueryParams
	): Promise<ResponseAbstractList<Product>> {
		return this.productService.getProductsList(req['user'], queryParams);
	}

	@Put(':id')
	@ApiForbiddenResponse({
		type: ForbiddenSourceDto,
		description: 'Truy cập bị chặn'
	})
	@ApiOperation({ summary: 'Cập nhật SP' })
	async updateProduct(@Req() req: Request, @Param('id') id: number, @Body() data: UpdateProductDTO): Promise<void> {
		return this.productService.updateProduct(req['user'], id, data);
	}
	
	@Get(':id/logs')
	@ApiForbiddenResponse({
		type: ForbiddenSourceDto,
		description: 'Truy cập bị chặn'
	})
	@ApiOperation({ summary: 'Xem logs SP' })
	@ApiOkResponse({
		type: ProductByIdResponseDto,
		description: 'Xem chi tiết sản phẩm'
	})
	async getLogsById(
		@Param('id') id: number,
		@Query() queryParams: ProductLogQueryParamsDto
	): Promise<ResponseAbstractList<ProductLog>> {
		return this.productService.getLogsById(id, queryParams);
	}

	@Get(':id')
	@ApiForbiddenResponse({
		type: ForbiddenSourceDto,
		description: 'Truy cập bị chặn'
	})
	@ApiOperation({ summary: 'Xem chi tiết SP' })
	@ApiOkResponse({
		type: ProductByIdResponseDto,
		description: 'Xem chi tiết sản phẩm'
	})
	async getById(@Param('id') id: number, @Req() req: Request): Promise<Product> {
		return this.productService.getById(id, req['user']);
	}

}
