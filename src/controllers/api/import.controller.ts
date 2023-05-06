import { Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { UploadedFile } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiHeaders, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import { join } from 'path';
import { ImportService } from 'src/services/import.service';
import { excelImportBySellerIdDir } from 'src/utils/exceljs.helper';
@Controller('imports')
@ApiTags('Imports')
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
export class ImportController {
	constructor(private readonly importService: ImportService) {}
	@Post('products')
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
	async importProduct(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
		await this.importService.importProduct(req['user'], file);
	}
}
