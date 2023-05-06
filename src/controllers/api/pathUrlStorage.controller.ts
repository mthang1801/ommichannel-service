import { Body, Controller, Post } from '@nestjs/common';
import { CreatePathUrlDto } from 'src/dtos/requests/urlPath/createPathUrl.dto';
import { PathUrlStorageService } from 'src/services/pathUrlStorage.service';

@Controller('path-urls')
export class PathUrlStorageController {
	constructor(private readonly pathUrlStorageService: PathUrlStorageService) {}
	@Post()
	async createUrlPath(@Body() data: CreatePathUrlDto): Promise<void> {
		this.pathUrlStorageService.createPathUrls(data);
	}
}
