import { Controller, Param, Post } from '@nestjs/common';
import { Body, Get, Put, Req } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateGeneralSettingDto } from 'src/dtos/requests/generalSetting/updateGeneralSetting.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { SellerGeneralSetting } from 'src/models/sellerGeneralSetting.model';
import { SellerGeneralSettingService } from 'src/services/sellerGeneralSetting.service';

@Controller('general-settings')
@ApiTags('Thiết lập chung')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		description: 'Access Token',
		example: 'accessToken',
		required: true
	},
	{
		name: 'x-auth-uuid',
		example: 'xAuthUUID',
		required: true
	},
	{
		name: 'Content-Type',
		example: 'application/json'
	}
])
export class SellerGeneralSettingController {
	constructor(private readonly generalSettingService: SellerGeneralSettingService) {}

	@Post(':seller_id')
	async createImportGood(@Param('seller_id') seller_id: number): Promise<void> {
		return this.generalSettingService.createGeneralSettingWithoutAuth(seller_id);
	}

	@Get()
	async getGeneralSettingList(@Req() req: Request): Promise<SellerGeneralSetting[]> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.generalSettingService.getGeneralSettingList(sellerId);
	}

	@Put()
	async updateGeneralSetting(@Req() req: Request, @Body() data: UpdateGeneralSettingDto): Promise<void> {
		return this.generalSettingService.updateGeneralSetting(data);
	}
}
