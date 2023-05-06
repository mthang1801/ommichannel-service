import { Controller, Get, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { WarehouseStaffQueryParamsDto } from 'src/dtos/requests/warehouseStaff/warehouseStaffQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { WarehouseStaff } from 'src/models/warehouseStaff.model';
import { WarehouseStaffService } from 'src/services/warehouseStaff.service';

@Controller('warehouse-staffs')
export class WarehouseStaffController {
	constructor(private readonly warehouseStaffService: WarehouseStaffService) {}

	@Get()
	async getWarehouseStaffList(
		@Req() req: Request,
		@Query() queryParams: WarehouseStaffQueryParamsDto
	): Promise<ResponseAbstractList<WarehouseStaff>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.warehouseStaffService.getWarehouseStaffList(sellerId, queryParams);
	}
}
