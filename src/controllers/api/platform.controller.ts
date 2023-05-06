import { Controller, Get, Query, Req } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { PlatformQueryParamsDto } from 'src/dtos/requests/platform/platformQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Platform } from 'src/models/platform.model';
import { PlatformService } from 'src/services/platform.service';

@Controller('platforms')
export class PlatformController {
	constructor(private readonly platformService: PlatformService) {}

	@SkipAuth()
	@Get()
	async getPlatformList(@Query() queryParams: PlatformQueryParamsDto): Promise<any> {
		return this.platformService.getPlatformList(queryParams);
	}
}
