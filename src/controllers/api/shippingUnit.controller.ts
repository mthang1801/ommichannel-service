import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { CalcShippingFeeDto } from 'src/dtos/requests/shippingUnit/calcShippingFee.dto';
import { ConnectShippingUnitDto } from 'src/dtos/requests/shippingUnit/connectShippingUnit.dto';
import { ConnectToNTLDto } from 'src/dtos/requests/shippingUnit/connectToNTL.dto';
import { ShippingUnitQueryParamsDto } from 'src/dtos/requests/shippingUnit/shippingUnitQueryParams.dto';
import { UpdateServicePaymentDto } from 'src/dtos/requests/shippingUnit/updateServicePayment.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { SellerShippingUnit } from 'src/models/sellerShippingUnit.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { ShippingUnitService } from 'src/services/shippingUnit.service';

@Controller('shipping-units')
@ApiTags('Đơn vị vận chuyển')
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
export class ShippingUnitController {
	constructor(private readonly shippingUnitService: ShippingUnitService) {}

	@Put('change-status/:id')
	async changeStatus(@Param('id') id: number): Promise<ShippingUnit> {
		return this.shippingUnitService.changeStatus(id);
	}

	@Put('ntl/connect')
	@ApiBody({ type: ConnectToNTLDto })
	@ApiOperation({ summary: 'Kết nối đến đơn vị vận Nhattin Logistic' })
	async connectToNTLShippingUnit(@Req() req: Request, @Body() data: ConnectToNTLDto): Promise<void> {
		await this.shippingUnitService.connectToNTLShippingUnit(req['user'], data);
	}

	@Put(':id/connect')
	@ApiBody({ type: ConnectShippingUnitDto })
	@ApiOperation({ summary: 'Kết nối đến đơn vị vận chuyển' })
	async connectToShippingUnit(
		@Param('id') id: number,
		@Req() req: Request,
		@Body() data: ConnectShippingUnitDto
	): Promise<void> {
		await this.shippingUnitService.connectToShippingUnit(id, req['user'], data);
	}

	@Put(':id/disconnect')
	@ApiOperation({ summary: 'Ngắt kết nối đến đơn vị vận chuyển' })
	async disconnectToShippingUnit(@Req() req: Request, @Param('id') id: number): Promise<void> {
		await this.shippingUnitService.disconnectToShippingUnit(req['user'], id);
	}

	@Post('calc-fee')
	@ApiOkResponse()
	async caclShippingFee(@Req() req: Request, @Body() data: CalcShippingFeeDto): Promise<any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.shippingUnitService.calcShippingFee(sellerId, data);
	}

	@Put(':id/update-service-payment')
	@ApiOperation({ summary: 'Cập nhật services, thanh toán' })
	async updateServicePayment(@Req() req: Request, @Param("id") id : number, @Body() data: UpdateServicePaymentDto): Promise<void> {
		return this.shippingUnitService.updateServicePayment(req["user"], id, data)
	}

	@Get()
	async getShippingUnitList(
		@Query() queryParams: ShippingUnitQueryParamsDto,
		@Req() req: Request
	): Promise<ResponseAbstractList<any>> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		if (isSpecialAdminByRoleCode(roleCode)) {
			return this.shippingUnitService.getShippingUnitListSuperAdmin(req['user'], queryParams);
		}
		return this.shippingUnitService.getShippingUnitList(req['user'], queryParams);
	}

	@Get(':id')
	async getByShippingUnitId(@Param('id') id: number, @Req() req: Request): Promise<SellerShippingUnit> {
		return this.shippingUnitService.getByShippingUnitId(req['user'], id);
	}
}
