import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { CronFunctionSchedulerPayloadDto } from 'src/dtos/cronFunctionScheduler.dto';
import { CreateCronFunctionSchedulerDto } from 'src/dtos/requests/cronFunction/createCronFunctionScheduler.dto';
import { UpdateCronFunctionSchedulerDto } from 'src/dtos/requests/cronFunction/updateCronFunctionScheduler.dto';
import { CreateSellerPlatformDto } from 'src/dtos/requests/sellerPlatform/createSellerPlatform.dto';
import { SellerPlatformQueryParamsDto } from 'src/dtos/requests/sellerPlatform/sellerPlatformQueryParams.dto';
import { UpdateStatusSellerPlatformDto } from 'src/dtos/requests/sellerPlatform/updateStatusSellerPlatform.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { SellerPlatformPayloadDto } from 'src/dtos/sellerPlatformPayload.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { SellerPlatform } from 'src/models/sellerPlatform.model';
import { SellerPlatformService } from 'src/services/sellerPlatform.service';

@Controller('seller-platforms')
export class SellerPlatformController {
	constructor(private readonly sellerPlatformService: SellerPlatformService) {}

	@Post()
	async createSellerPlatform(@Req() req: Request, @Body() data: CreateSellerPlatformDto): Promise<void> {
		const { sellerId } = req['user'] as IUserAuth;
		await this.sellerPlatformService.createSellerPlatform(data, sellerId);
	}

	@Put('update-status/:id')
	async updateStatus(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateStatusSellerPlatformDto
	): Promise<void | SellerPlatform> {
		const { sellerId } = req['user'] as IUserAuth;

		const sellerPlatformPayloadDto: SellerPlatformPayloadDto = {
			...data
		};

		return this.sellerPlatformService.updateStatus(id, sellerId, sellerPlatformPayloadDto);
	}

	@Get()
	async getSellerPlatformList(
		@Req() req: Request,
		@Query() queryParams: SellerPlatformQueryParamsDto
	): Promise<ResponseAbstractList<SellerPlatform>> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		if (isSpecialAdminByRoleCode(roleCode)) {
			return this.sellerPlatformService.getSellerPlatformListSuperAdmin(queryParams);
		}
		return this.sellerPlatformService.getSellerPlatformList(sellerId, queryParams);
	}

	@Get('by-seller-id')
	async getSellerPlatformListBySellerId(
		@Req() req: Request,
		@Query() queryParams: SellerPlatformQueryParamsDto
	): Promise<ResponseAbstractList<SellerPlatform>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.sellerPlatformService.getSellerPlatformList(sellerId, queryParams);
	}

	@Get(':platform_id')
	async getProvinceById(@Req() req: Request, @Param('platform_id') platform_id: number): Promise<any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.sellerPlatformService.getSellerPlatformByPlatformId(sellerId, platform_id);
	}

	@Post('schedulers')
	async createCronFunctionScheduler(@Req() req: Request, @Body() data: CreateCronFunctionSchedulerDto): Promise<any> {
		const { sellerId } = req['user'] as IUserAuth;
		await this.sellerPlatformService.createCronFunctionScheduler(data, sellerId);
	}

	@Put('schedulers/:id')
	async updateCronFunctionScheduler(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateCronFunctionSchedulerDto
	): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		const cronFunctionSchedulerPayloadDto: CronFunctionSchedulerPayloadDto = {
			...data
		};
		return this.sellerPlatformService.updateCronFunctionScheduler(id, cronFunctionSchedulerPayloadDto);
	}
}
