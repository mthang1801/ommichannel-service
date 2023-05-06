import { Controller, Get, Query, Req } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ProvinceQueryParamsDto } from 'src/dtos/requests/province/provinceQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Province } from 'src/models/province.model';
import { ProvinceService } from 'src/services/province.service';

@Controller('provinces')
export class ProvinceController {
	constructor(private readonly provinceService: ProvinceService) {}

	@Get()
	async getProvinceList(@Query() queryParams: ProvinceQueryParamsDto): Promise<ResponseAbstractList<Province>> {
		return this.provinceService.getProvinceList(queryParams);
	}
}
