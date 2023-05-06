import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { parseDataSqlizeResponse, getPageOffsetLimit } from 'src/utils/functions.utils';
import { Scheduler } from 'src/models/scheduler.model';
import { Op } from 'sequelize';
import { CreateSchedulerDto } from 'src/dtos/requests/scheduler/createScheduler.dto';
import { SchedulerPayloadDto } from 'src/dtos/schedulerPayload.dto';
import { SchedulerQueryParamsDto } from 'src/dtos/requests/scheduler/schedulerQueryParams.dto';

@Injectable()
export class SchedulerService {
	constructor(
		@InjectModel(Scheduler)
		private readonly SchedulerModel: typeof Scheduler
	) {}

	async createScheduler(data: CreateSchedulerDto): Promise<void | Scheduler> {
		const scheduler = await this.SchedulerModel.findOne({
			where: { scheduler_interval: data?.scheduler_interval }
		});

		if (scheduler) {
			throw new HttpException('Đã tồn tại.', 400);
		}

		const payload: SchedulerPayloadDto = {
			...data
		};

		return parseDataSqlizeResponse(await this.SchedulerModel.create(payload as any));
	}

	async updateScheduler(id: number, payload: SchedulerPayloadDto): Promise<any> {
		await this.SchedulerModel.update(payload, { where: { id } });

		return parseDataSqlizeResponse(await this.SchedulerModel.findOne({ where: { id } }));
	}

	async getSchedulerList(queryParams: SchedulerQueryParamsDto): Promise<ResponseAbstractList<Scheduler>> {
		const { q, status } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = {};

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					id: {
						[Op.like]: `%${q}%`
					},
					scheduler_interval: {
						[Op.like]: `%${q}%`
					},
					description: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status: status === 'true'
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.SchedulerModel.findAndCountAll({
				where: _whereClause,
				order: [['updated_at', 'DESC']],
				limit,
				offset
			})
		);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getSchedulerById(id): Promise<Scheduler> {
		return this.SchedulerModel.findOne({
			where: { id }
		});
	}
}
