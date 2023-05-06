import { Put } from '@nestjs/common';
import { Body, Controller, Get, Req } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateCustomerPointConfigDto } from 'src/dtos/requests/customerPointConfig/updateCustomerPointConfig.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CustomerPointConfig } from 'src/models/customerPointConfig.model';
import { CustomerPointConfigService } from 'src/services/customerPointConfig.service';

@Controller('customer-point-configs')
@ApiTags('Điểm tích luỹ')
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
export class CustomerPointConfigController {
	constructor(private readonly customerPointConfigService: CustomerPointConfigService) {}

	// @ApiBody({ type: CreateCustomerPointConfigDto })
	// @ApiOperation({ summary: 'Tạo chương trình điểm tích luỹ' })
	// @Post()
	// async createCustomerPointConfig(@Req() req: Request, @Body() data: CreateCustomerPointConfigDto): Promise<any> {
	// 	return this.customerPointConfigService.createCustomerPointConfig(data, req['user']);
	// }

	@ApiBody({ type: UpdateCustomerPointConfigDto })
	@ApiOperation({ summary: 'Cập nhật chương trình điểm tích luỹ' })
	@Put()
	async updateCustomerPointConfi(@Req() req: Request, @Body() data: UpdateCustomerPointConfigDto): Promise<any> {
		return this.customerPointConfigService.updateCustomerPointConfig(data, req['user']);
	}

	// @ApiOperation({ summary: 'Lấy danh sách phiếu kiểm hàng' })
	// @ApiPaginatedResponse(InventoryReceipt)
	// @Get()
	// async getInventoryReceiptList(
	// 	@Req() req: Request,
	// 	@Query() queryParams: InventoryReceiptQueryParamsDto
	// ): Promise<ResponseAbstractList<InventoryReceipt>> {
	// 	const { sellerId } = req['user'] as IUserAuth;
	// 	return this.inventoryReceiptService.getInventoryReceiptList(sellerId, queryParams);
	// }

	@ApiOperation({ summary: 'Lấy chi tiết chương trình điểm tích luỹ' })
	@Get()
	async getInventoryReceiptById(@Req() req: Request): Promise<CustomerPointConfig> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.customerPointConfigService.getCustomerPointConfig(sellerId);
	}

	// @ApiOperation({ summary: 'Lấy danh sách sản phẩm trong chi tiết phiếu kiểm hàng' })
	// @Get('details/:id')
	// async getInventoryReceiptDetailsById(
	// 	@Req() req: Request,
	// 	@Param('id') id: number,
	// 	@Query() queryParams: InventoryReceiptDetailQueryParamsDto
	// ): Promise<any> {
	// 	const { sellerId } = req['user'] as IUserAuth;
	// 	return this.inventoryReceiptService.getInventoryReceiptDetailsById(id, sellerId, queryParams);
	// }
}
