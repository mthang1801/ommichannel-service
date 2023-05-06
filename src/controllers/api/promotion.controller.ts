import { Body, Controller, Param, Req } from '@nestjs/common';
import { Get, Post, Put, Query } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreatePromotionDto } from 'src/dtos/requests/promotions/createPromotion.dto';
import { GetPromotionsListDto } from 'src/dtos/requests/promotions/getPromotionsList.dto';
import { UpdateMultiplePromotionStatusDto } from 'src/dtos/requests/promotions/updateMultiplePromotionStatus.dto';
import { UpdatePromotionDto } from 'src/dtos/requests/promotions/updatePromotion.dto';
import { CreatePromotionProgramDto } from 'src/dtos/requests/promotionsProgram/createPromotionProgram.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { PromotionService } from 'src/services/promotion.service';
import { PromotionProgram } from '../../models/promotionProgram.model';

@Controller('promotions')
@ApiTags('Chương trình Chiết khấu')
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
export class PromotionController {
	constructor(private readonly promotionService: PromotionService) {}

	@Post()
	@ApiOperation({ summary: 'Tạo chương trình' })
	@ApiBody({ type: CreatePromotionProgramDto })
	async createPromotionProgram(@Body() data: CreatePromotionDto, @Req() req: Request): Promise<void> {
		await this.promotionService.createPromotion(req['user'], data);
	}

	@Get()
	@ApiOperation({ summary: 'Lấy danh sách chương trình' })
	async getPromotionProgramsList(
		@Req() req: Request,
		@Query() queryParams: GetPromotionsListDto
	): Promise<ResponseAbstractList<PromotionProgram>> {
		return await this.promotionService.getPromotionsList(req['user'], queryParams);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Lấy chi tiết chương trình' })
	async getPromotionProgramById(@Param('id') id: number, @Req() req: Request): Promise<PromotionProgram> {
		return await this.promotionService.getPromotionProgramById(req['user'], id);
	}

	@Put('update-multiple-promotions-status')
	async updateMultiplePromotionStatus(
		@Req() req: Request,
		@Body() data: UpdateMultiplePromotionStatusDto
	): Promise<void> {
		await this.promotionService.updateMultiplePromotionStatus(req['user'], data);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Cập nhật chương trình' })
	async updatePromotionProgram(
		@Param('id') id: number,
		@Req() req: Request,
		@Body() data: UpdatePromotionDto
	): Promise<void> {
		await this.promotionService.updatePromotion(req['user'], id, data);
	}
}
