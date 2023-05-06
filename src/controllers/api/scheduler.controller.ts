import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CreateSchedulerDto } from 'src/dtos/requests/scheduler/createScheduler.dto';
import { UpdateSchedulerDto } from 'src/dtos/requests/scheduler/updateScheduler.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { SchedulerPayloadDto } from 'src/dtos/schedulerPayload.dto';
import { Scheduler } from 'src/models/scheduler.model';
import { SchedulerService } from 'src/services/scheduler.service';

@Controller('schedulers')
export class SchedulerController {
	constructor(private readonly schedulerService: SchedulerService) {}

	@Post()
	async createScheduler(@Req() req: Request, @Body() data: CreateSchedulerDto): Promise<void | Scheduler> {
		return this.schedulerService.createScheduler(data);
	}

	@Put(':id')
	async updateScheduler(@Param('id') id: number, @Body() data: UpdateSchedulerDto): Promise<void | Scheduler> {
		const schedulerPayload: SchedulerPayloadDto = {
			...data
		};

		return this.schedulerService.updateScheduler(id, schedulerPayload);
	}

	@Get()
	async getSchedulerList(@Query() queryParams): Promise<ResponseAbstractList<Scheduler>> {
		return this.schedulerService.getSchedulerList(queryParams);
	}

	@Get(':id')
	async getSchedulerById(@Param('id') id: number): Promise<Scheduler> {
		return this.schedulerService.getSchedulerById(id);
	}
}
