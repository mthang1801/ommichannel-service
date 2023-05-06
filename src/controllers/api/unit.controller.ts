import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Unit } from 'src/models/unit.model';
import { UnitService } from 'src/services/unit.service';

@Controller('units')
export class UnitController {
	constructor(private readonly unitService: UnitService) {}

	@SkipAuth()
	@Get()
	async getShippingUnitList(@Query() queryParams): Promise<ResponseAbstractList<Unit>> {
		return this.unitService.getUnitList(queryParams);
	}
}
