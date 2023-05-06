import { Body, Controller, Get, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Transaction } from 'sequelize';
import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { CreateRolesDto } from 'src/dtos/requests/roles/createRole.dto';
import { RoleQueryParamsDto } from 'src/dtos/requests/roles/roleQueryParams.dto';
import { UpdateRoleGroupDto } from 'src/dtos/requests/roles/updateRole.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Role } from 'src/models/role.model';
import { RoleService } from 'src/services/role.service';
import { ApiCreatedResponseExtra } from 'src/swagger/apiCreatedResponse.dto';

@Controller('roles')
@ApiTags('Vai trò người dùng')
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
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post()
	@ApiCreatedResponseExtra()
	@ApiOperation({ summary: 'Tạo vai trò người dùng' })
	@ApiBody({ type: CreateRolesDto })
	@UseInterceptors(TransactionInterceptor)
	async createRole(
		@Body() data: CreateRolesDto,
		@Req() req: Request,
		@TransactionParam() transaction: Transaction
	): Promise<void> {
		await this.roleService.createRole(data, req['user'], transaction);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Cập nhật vai trò người dùng' })
	@ApiBody({ type: UpdateRoleGroupDto })
	@UseInterceptors(TransactionInterceptor)
	async updateRole(
		@Param('id') id: number,
		@Body() data: UpdateRoleGroupDto,
		@Req() req: Request,
		@TransactionParam() transaction: Transaction
	) {
		await this.roleService.updateRole(data, id, req['user'], transaction);
	}

	@Get()
	@ApiOperation({ summary: 'Lấy danh sách vai trò người dùng' })
	async getRolesList(
		@Query() queryParams: RoleQueryParamsDto,
		@Req() req: Request
	): Promise<ResponseAbstractList<Role>> {
		return this.roleService.getRolesList(req['user'], queryParams);
	}

	@ApiOperation({ summary: 'Lấy thông tin vai trò người dùng' })
	@ApiBody({ type: Role })
	@Get(':id')
	async getRoleById(@Param('id') id: number): Promise<Role> {
		return this.roleService.getById(id);
	}
}
