import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { WardQueryParamsDto } from 'src/dtos/requests/ward/wardQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Ward } from 'src/models/ward.model';
import { WardService } from 'src/services/ward.service';

@Controller('wards')
export class WardController {
	constructor(private readonly wardService: WardService) {}

	@Get()
	async getWardList(@Query() queryParams: WardQueryParamsDto): Promise<ResponseAbstractList<Ward>> {
		return this.wardService.getWardList(queryParams);
	}
}
