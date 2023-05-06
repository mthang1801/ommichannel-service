import { Controller, Get, Query } from '@nestjs/common/decorators';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { DataTypes } from 'src/models/dataType.model';
import { DataTypeService } from 'src/services/dataType.service';

@Controller('data-types')
export class DataTypeController {
	constructor(private readonly dataTypeService: DataTypeService) {}

	@Get()
	async getDataTypeList(@Query() queryParams): Promise<ResponseAbstractList<DataTypes>> {
		return this.dataTypeService.getDataTypeList(queryParams);
	}
}
