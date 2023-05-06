import { Param, Put, UseInterceptors } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, Req, Res, UploadedFile } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CreateInventoryReceiptDto } from 'src/dtos/requests/inventoryReceipt/createInventoryReceipt.dto';
import { InventoryReceiptQueryParamsDto } from 'src/dtos/requests/inventoryReceipt/inventoryReceiptQueryParams.dto';
import { UpdateInventoryReceiptDto } from 'src/dtos/requests/inventoryReceipt/updateInventoryReceipt.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { InventoryReceipt } from 'src/models/inventoryReceipt.model';
import { InventoryReceiptService } from 'src/services/inventoryReceipt.service';
import { InventoryReceiptDetailQueryParamsDto } from 'src/dtos/requests/inventoryReceipt/inventoryReceiptDetailQueryParams.dto';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiOperation, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { join } from 'path';
import { excelImportBySellerIdDir } from 'src/utils/exceljs.helper';
import * as fs from 'fs';

@Controller('inventory-receipts')
@ApiTags('Kiểm hàng')
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
export class InventoryReceiptController {
	constructor(private readonly inventoryReceiptService: InventoryReceiptService) {}

	@Get('export-inventory-receipt-sample')
	async exportInventoryReceiptSample(@Req() req: Request, @Res() res) {
		const filePath = await this.inventoryReceiptService.exportInventoryReceiptSample(req['user']);
		res.download(filePath);
	}

	@Post('inventory-receipts')
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ status: 413, description: 'File too large' })
	@ApiResponse({ status: 500, description: 'Internal Server' })
	@ApiResponse({ status: 504, description: 'Request Timeout' })
	@ApiOperation({ summary: 'Upload multiple files' })
	@UseInterceptors(
		FileInterceptor('file', {
			storage: multer.diskStorage({
				destination: (req, file, cb) => {
					const targetDir = join(excelImportBySellerIdDir, String(req['user']['sellerId']));
					if (!fs.existsSync(targetDir)) {
						fs.mkdirSync(targetDir, { recursive: true });
					}
					cb(null, targetDir);
				},
				filename: (req, file, cb) => {
					const filename = `${file.originalname}`;
					return cb(null, filename);
				}
			})
		})
	)
	async importInventoryReceipt(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
		await this.inventoryReceiptService.importInventoryReceipt(req['user'], file);
	}

	@ApiBody({ type: CreateInventoryReceiptDto })
	@ApiOperation({ summary: 'Tạo phiếu kiểm hàng' })
	@Post()
	async createInventoryReceipt(@Req() req: Request, @Body() data: CreateInventoryReceiptDto): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.inventoryReceiptService.createInventoryReceipt(data, req['user']);
	}

	@ApiBody({ type: UpdateInventoryReceiptDto })
	@ApiOperation({ summary: 'Cập nhật phiếu kiểm hàng' })
	@Put(':id')
	async updateInventoryReceipt(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateInventoryReceiptDto
	): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.inventoryReceiptService.updateInventoryReceipt(req['user'], id, data);
	}

	@ApiOperation({ summary: 'Lấy danh sách phiếu kiểm hàng' })
	@ApiPaginatedResponse(InventoryReceipt)
	@Get()
	async getInventoryReceiptList(
		@Req() req: Request,
		@Query() queryParams: InventoryReceiptQueryParamsDto
	): Promise<ResponseAbstractList<InventoryReceipt>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.inventoryReceiptService.getInventoryReceiptList(sellerId, queryParams);
	}

	@ApiOperation({ summary: 'Lấy chi tiết phiếu kiểm hàng' })
	@Get(':id')
	async getInventoryReceiptById(@Req() req: Request, @Param('id') id: number): Promise<InventoryReceipt | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.inventoryReceiptService.getInventoryReceiptById(id, sellerId);
	}

	@ApiOperation({ summary: 'Lấy danh sách sản phẩm trong chi tiết phiếu kiểm hàng' })
	@Get('details/:id')
	async getInventoryReceiptDetailsById(
		@Req() req: Request,
		@Param('id') id: number,
		@Query() queryParams: InventoryReceiptDetailQueryParamsDto
	): Promise<any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.inventoryReceiptService.getInventoryReceiptDetailsById(id, sellerId, queryParams);
	}
}
