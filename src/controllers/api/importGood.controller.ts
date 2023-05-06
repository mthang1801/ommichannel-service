import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CreateImportGoodDto } from 'src/dtos/requests/importGood/createImportGood.dto';
import { ImportGoodQueryParamsDto } from 'src/dtos/requests/importGood/importGoodQueryParams.dto';
import { UpdateImportGoodDto } from 'src/dtos/requests/importGood/updateImportGood.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { ImportGood } from 'src/models/importGood.model';
import { ImportGoodService } from 'src/services/importGood.service';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiBody, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../swagger/apiPaginatedResponse.dto';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { excelImportBySellerIdDir } from 'src/utils/exceljs.helper';
import * as fs from 'fs';
import { join } from 'path';

@Controller('import-goods')
@ApiTags('Nhập hàng')
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
export class ImportGoodController {
	constructor(private readonly importGoodService: ImportGoodService) {}

	@Get('export-import-good-sample')
	async exportImportGoodSample(@Req() req: Request, @Res() res) {
		const filePath = await this.importGoodService.exportImportGoodSample(req['user']);
		res.download(filePath);
	}

	@Post('import-goods')
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
	async importImportGood(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
		await this.importGoodService.importImportGood(req['user'], file);
	}

	@ApiBody({ type: CreateImportGoodDto })
	@ApiOperation({ summary: 'Tạo đơn nhập hàng' })
	@Post()
	async createImportGood(@Req() req: Request, @Body() data: CreateImportGoodDto): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.importGoodService.createImportGood(data, req['user']);
	}

	@ApiBody({ type: UpdateImportGoodDto })
	@ApiOperation({ summary: 'Cập nhật đơn nhập hàng' })
	@Put(':id')
	async updateImportGood(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateImportGoodDto
	): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.importGoodService.updateImportGood(req['user'], id, data);
	}

	@ApiOperation({ summary: 'Lấy danh sách đơn nhập hàng' })
	@ApiPaginatedResponse(ImportGood)
	@Get()
	async getImportGoodList(
		@Req() req: Request,
		@Query() queryParams: ImportGoodQueryParamsDto
	): Promise<ResponseAbstractList<ImportGood>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.importGoodService.getImportGoodList(sellerId, queryParams);
	}

	@ApiOperation({ summary: 'Lấy chi tiết đơn nhập hàng theo id' })
	@Get(':id')
	async getImportGoodById(@Param('id') id: number): Promise<ImportGood> {
		return this.importGoodService.getImportGoodById(id);
	}
}
