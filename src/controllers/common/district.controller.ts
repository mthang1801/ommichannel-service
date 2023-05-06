import { Controller, Get, Query, Req, Param } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { DistrictQueryParamsDto } from 'src/dtos/requests/district/districtQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { District } from 'src/models/district.model';
import { DistrictService } from 'src/services/district.service';

@Controller('districts')
export class DistrictController {
	constructor(private readonly districtService: DistrictService) {}

	@Get()
	async getDistrictList(@Query() queryParams: DistrictQueryParamsDto): Promise<ResponseAbstractList<District>> {
		return this.districtService.getDistrictList(queryParams);
	}
}
