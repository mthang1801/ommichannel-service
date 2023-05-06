import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CodAndCarriageBillOverviewDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillOverviewQueryParam.dto';
import { OrderDeliveryOverviewQueryParamDto } from 'src/dtos/requests/order/orderDeliveryOverviewQueryParam.dto';
import { ReportDeliveryQueryParamDto } from 'src/dtos/requests/order/reportDeliveryQueryParam.dto';
import { CodAndCarriageBillOverviewResponseDto } from 'src/dtos/responses/codAndCarriageBill/codAndCarriageBillOverview.dto';
import { DeliveryStatusDto } from 'src/dtos/responses/order/deliveryOverview.dto';
import { DeliveryReportDto } from 'src/dtos/responses/order/deliveryReport.dto';
import { ProportionDeliveryShippingFeeByShippingUnitDto } from 'src/dtos/responses/order/proportionDeliveryShippingFeeByShippingUnit.dto';
import { TransportOverviewService } from 'src/services/transportOverview.service';
import { ApiOkResponseExtra } from 'src/swagger/apiOkResponse.dto';

@Controller('transport-overview')
@ApiTags('Tổng quan vận chuyển')
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
export class TransportOverviewController {
	constructor(private readonly transportOverviewService : TransportOverviewService) {}

	@Get('/statuses')
	@ApiOperation({ summary: 'Tổng quan đơn vị vận chuyển' })
	async getTransportOverviewStatuses(
		@Req() req: Request,
		@Query() queryParams: OrderDeliveryOverviewQueryParamDto
	): Promise<DeliveryStatusDto> {
		return this.transportOverviewService.getTransportOverviewStatuses(req['user'], queryParams);
	}

	@Get("/cod-carriage")
	@ApiOperation({summary : "Tổng quan đối soát COD"})
	async getCodAndCarriageOverview(@Req() req : Request,@Query() queryParams : CodAndCarriageBillOverviewDto ) : Promise<CodAndCarriageBillOverviewResponseDto>{
		return this.transportOverviewService.getCodAndCarriageOverview(req["user"], queryParams)
	}

	@Get('proportion-by-shipping-unit')
	@ApiOperation({ summary: 'Tỉ trọng phí vận chuyển theo shipping unit' })
	async reportProportionByShippingUnit(@Req() req: Request): Promise<ProportionDeliveryShippingFeeByShippingUnitDto> {
		return this.transportOverviewService.reportProportionByShippingUnit(req['user']);
	}

	@Get('weekly-general-report')
	@ApiOperation({ summary: 'Tổng quan tình hình vận chuyển' })
	@ApiOkResponseExtra(DeliveryReportDto)
	async reportDelivery(
		@Req() req: Request,
		@Query() queryParams: ReportDeliveryQueryParamDto
	): Promise<any> {
		return this.transportOverviewService.reportDeliveryByWeek(req['user'], queryParams);
	}

	@Get('proportion')
	@ApiOperation({ summary: 'Tỉ trọng phí vận chuyển' })
	async reportProportionShippingFee(
		@Req() req: Request,
		@Query('shipping_status_id') shippingStatusId: number
	): Promise<any> {
		return this.transportOverviewService.reportProportionShippingFee(req['user'], shippingStatusId);
	}


}
