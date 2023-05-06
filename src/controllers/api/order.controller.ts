import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors, Res } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { ExportOrdersListDto } from 'src/dtos/requests/exports/export-orders.dto';
import { CreateOrderDto } from 'src/dtos/requests/order/createOrder.dto';
import { NTLUpdateDeliveryDto } from 'src/dtos/requests/order/ntlUpdateDelivery.dto';
import { OrderDeliveryQueryParamsDto } from 'src/dtos/requests/order/orderDeliveryQueryParams.dto';
import { OrderQueryParamsDto } from 'src/dtos/requests/order/orderQueryParams.dto';
import { UpdateOrderDto } from 'src/dtos/requests/order/updateOrder.dto';
import { UpdateOrderStatusDto } from 'src/dtos/requests/order/updateOrderStatus.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { OrderReportStatusesDto } from 'src/dtos/responses/order/orderReportStatus.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Order } from 'src/models/order.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { OrderStatusLog } from 'src/models/orderStatusLog.model';
import { OrderService } from 'src/services/order.service';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';
@Controller('orders')
@ApiTags('Đơn hàng')
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
export class OrderController {
	constructor(private readonly orderService: OrderService) {}
	@Get('export-order-sample')
	async exportOrderSample(@Req() req: Request, @Res() res) {
		const filePath = await this.orderService.exportOrderSample(req['user']);
		res.download(filePath);
	}

	@Get('export-orders')
	async exportOrdersList(@Req() req: Request, @Res() res, @Query() queryParams: ExportOrdersListDto): Promise<any> {
		const filePath = await this.orderService.exportOrderList(req['user'], queryParams);
		res.download(filePath);
	}

	@ApiBody({ type: CreateOrderDto })
	@ApiOperation({ summary: 'Tạo đơn hàng' })
	@Post()
	async createOrder(@Req() req: Request, @Body() data: CreateOrderDto): Promise<Order> {
		return await this.orderService.createOrder(data, req['user']);
	}

	@Put('update-order-statuses')
	@UseInterceptors(TransactionInterceptor)
	@ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
	async updateOrderStatuses(
		@Req() req: Request,
		@Body() data: UpdateOrderStatusDto,
		@TransactionParam() transaction: Transaction
	): Promise<any> {
		await this.orderService.updateOrderStatuses(req['user'], data, transaction);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Cập nhật đơn hàng' })
	@ApiBody({ type: UpdateOrderDto })
	@UseInterceptors(TransactionInterceptor)
	async updateOrder(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateOrderDto,
		@TransactionParam() transaction: Transaction
	): Promise<void> {
		return this.orderService.updateOrder(req['user'], id, data, transaction);
	}

	@ApiOperation({ summary: 'Huỷ đơn hàng' })
	@ApiOkResponse()
	@UseInterceptors(TransactionInterceptor)
	@Put(':id/cancel-order')
	async cancelOrder(
		@Req() req: Request,
		@Param('id') id: number,
		@TransactionParam() transaction: Transaction
	): Promise<void> {
		await this.orderService.cancelOrder(req['user'], id, transaction);
	}

	@Get()
	@ApiPaginatedResponse(Order)
	async getOrderList(
		@Req() req: Request,
		@Query() queryParams: OrderQueryParamsDto
	): Promise<ResponseAbstractList<Order>> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.orderService.getOrderList(sellerId, queryParams);
	}

	@Get('report-order-statuses')
	@ApiOperation({ summary: 'Báo cáo trạng thái đơn hàng' })
	@ApiOkResponse({ type: OrderReportStatusesDto })
	async reportOrderStatuses(
		@Req() req: Request,
		@Query() queryParams: OrderQueryParamsDto
	): Promise<OrderReportStatusesDto> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.orderService.reportOrderStatuses(sellerId, queryParams);
	}

	@Get('deliveries')
	@ApiOperation({ summary: 'Danh sách vận đơn' })
	async getOrderDeliveriesList(
		@Req() req: Request,
		@Query() queryParams: OrderDeliveryQueryParamsDto
	): Promise<ResponseAbstractList<OrderDelivery>> {
		return this.orderService.getOrderDeliveriesList(req['user'], queryParams);
	}

	@Get('deliveries/:delivery_code')
	@ApiOperation({ summary: 'Lấy chi tiết vận đơn' })
	async getOrderDeliveryByDeliveryCode(
		@Req() req: Request,
		@Param('delivery_code') delivery_code: string
	): Promise<any> {
		return this.orderService.getOrderDeliveryByDeliveryCode(req['user'], delivery_code);
	}

	@Get(':id')
	async getOrderById(@Req() req: Request, @Param('id') id: number): Promise<Order> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.orderService.getOrderById(id, sellerId);
	}

	@Get(':id/logs')
	@ApiOperation({ summary: 'lấy lịch sử đơn hàng' })
	@ApiPaginatedResponse(OrderStatusLog)
	async getOrderLogs(@Param('id') id: number): Promise<ResponseAbstractList<OrderStatusLog>> {
		return this.orderService.getOrderLogs(id);
	}

	@SkipAuth()
	@Post(':shippingUnit/update-delivery')
	@ApiOperation({ summary: 'Hook lắng nghe vận đơn từ đơn vị vận chuyển' })
	async hookListenCallbackNotificationFromShippingUnits(
		@Body() data: any,
		@Req() req: Request,
		@Param('shippingUnit') shippingUnit: 'ntl' | 'ntx'
	): Promise<void> {
		await this.orderService.listenCallbackDilveryFromShippingUnit(shippingUnit, data, req);
	}
}
