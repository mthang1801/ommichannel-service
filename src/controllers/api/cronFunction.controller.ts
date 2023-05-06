import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CronFunctionPayloadDto } from 'src/dtos/cronFunctionPayload.dto';
import { CreateCronFunctionDto } from 'src/dtos/requests/cronFunction/createCronFunction.dto';
import { CronFunctionQueryParamsDto } from 'src/dtos/requests/cronFunction/cronFunctionQueryParams.dto';
import { UpdateCronFunctionDto } from 'src/dtos/requests/cronFunction/updateCronFunction.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CronFunction } from 'src/models/cronFunction.model';
import { CronFunctionService } from 'src/services/cronFunction.service';

@Controller('cron-functions')
export class CronFunctionController {
	constructor(private readonly cronFunctionService: CronFunctionService) {}

	@Post()
	async createCronFunction(@Req() req: Request, @Body() data: CreateCronFunctionDto): Promise<void | CronFunction> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.cronFunctionService.createCronFunction(data, sellerId);
	}

	@Put(':id')
	async updateCronFunction(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateCronFunctionDto
	): Promise<void | CronFunction> {
		const { sellerId } = req['user'] as IUserAuth;

		return this.cronFunctionService.updateCronFunction(id, data);
	}

	@Get()
	async getCronFunctionList(
		@Req() req: Request,
		@Query() queryParams: CronFunctionQueryParamsDto
	): Promise<ResponseAbstractList<CronFunction>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.cronFunctionService.getCronFunctionList(sellerId, queryParams);
	}

	@Get(':id')
	async getSupplierById(@Param('id') id: number): Promise<CronFunction> {
		return this.cronFunctionService.getCronFunctionById(id);
	}
}
