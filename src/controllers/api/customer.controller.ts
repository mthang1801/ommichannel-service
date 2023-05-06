import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { UpdateCustomerPayload } from 'src/dtos/customerPayload.dto';
import { CreateCustomerDto } from 'src/dtos/requests/customer/createCustomer.dto';
import { CustomerQueryParamsDto } from 'src/dtos/requests/customer/customerQueryParams.dto';

import { UpdateCustomerDto } from 'src/dtos/requests/customer/updateCustomer.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Customer } from 'src/models/customer.model';
import { CustomerService } from 'src/services/customer.service';
import { OrderService } from 'src/services/order.service';

@Controller('customers')
@ApiTags('Khách hàng')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		required: true,
		description: 'Access Token',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
	},
	{
		name: 'x-auth-uuid',
		required: true,
		example: 'hdwqiouhqwoiehuiowq921467910djqwodjqwdnwqo'
	}
])
export class CustomerController {
	constructor(private readonly customerService: CustomerService, private readonly orderService: OrderService) {}
	@Post()
	@ApiOperation({summary : "Tạo KH"})
	@ApiBody({ type: CreateCustomerDto, description: 'Create An Example' })
	@UseInterceptors(TransactionInterceptor)
	async createCustomer(
		@Req() req: Request,
		@Body() data: CreateCustomerDto,
		@TransactionParam() transaction: Transaction
	): Promise<CreateCustomerDto> {
		const { sellerId } = req['user'] as IUserAuth;

		return await this.customerService.creatCustomer(data, sellerId, transaction);
	}

	@ApiOperation({summary : "Cập nhật KH"})
	@Put(':id')
	async updateCustomer(@Req() req: Request, @Param('id') id: number, @Body() data: UpdateCustomerDto): Promise<void> {
		const { sellerId } = req['user'] as IUserAuth;

		const customerPayload: UpdateCustomerPayload = {
			...data,
			seller_id: sellerId
		};

		await this.customerService.updateCustomer(id, sellerId, customerPayload);
	}

	@Get()
	@ApiOperation({summary : "Lấy danh sách KH"})
	async getCustomersList(
		@Req() req: Request,
		@Query() queryParams: CustomerQueryParamsDto
	): Promise<ResponseAbstractList<Customer>> {
		const { sellerId } = req['user'];
		return this.customerService.getCustomersList(sellerId, queryParams);
	}

	@Get(':id')
	@ApiOperation({summary : "Lấy thông tin KH"})
	async getCustomerById(@Req() req: Request, @Param('id') id: number): Promise<Customer> {
		const { sellerId } = req['user'];
		return this.customerService.getCustomerById(sellerId, id);
	}

	@ApiOperation({summary : "Kiểm tra Tự động tiêu điểm khi khách hàng có từ"})
	@Get(":id/auto-use-point")
	async autoUsedPoint(@Req() req: Request, @Param("id") id : number) : Promise<any>{
		return this.customerService.autoUsedPoint(req["user"], id);
	}
}
