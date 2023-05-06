import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
	Version,
	VERSION_NEUTRAL
} from '@nestjs/common';

import { Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as multer from 'multer';

import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadFileDto } from 'src/dtos/requests/upload.request.dto';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { UploadService } from 'src/services/upload.services';

@Controller('uploads')
@ApiTags('Uploads')
export class UploadController {
	constructor(private service: UploadService) {}

	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UploadFileDto,
		description: 'Upload List of files to CDN'
	})
	@ApiResponse({ status: 413, description: 'File too large' })
	@ApiResponse({ status: 500, description: 'Internal Server' })
	@ApiResponse({ status: 504, description: 'Request Timeout' })
	@ApiOperation({ summary: 'Upload multiple files' })
	@SkipAuth()
	@Version(VERSION_NEUTRAL)
	@Post()
	@UseInterceptors(
		FilesInterceptor('files', 100, {
			storage: multer.diskStorage({
				destination: (req, file, cb) => cb(null, './uploads'),
				filename: (req, file, cb) => {
					const filename = `${file.originalname}`;
					return cb(null, filename);
				}
			})
		})
	)
	async uploadFiles(@Body() data: UploadFileDto, @UploadedFiles() files: Array<Express.Multer.File>) {
		return this.service.uploadFiles(data, files);
	}

	@Version(VERSION_NEUTRAL)
	@SkipAuth()
	@ApiOperation({ summary: 'Get File by url with q query parameter' })
	@Get()
	async getFile(@Res() res: Response, @Query('q') q: string) {
		return this.service.getFile(q);
	}
}
