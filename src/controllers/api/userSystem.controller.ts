import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { CreateUserSystemDto } from 'src/dtos/requests/user/createUserSystem.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { UserService } from 'src/services/user.service';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { UserSystemQueryParamsDto } from 'src/dtos/requests/user/userSystemQueryParams.dto';
import { User } from 'src/models/user.model';
import { UpdateUserSystemDto } from 'src/dtos/requests/user/updateUserSystem.dto';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';

@Controller('user-systems')
@ApiTags('Người dùng hệ thống')
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
export class UserSystemController {
	constructor(private readonly userService: UserService) {}

	@ApiBody({ type: CreateUserSystemDto })
	@ApiOperation({ summary: 'Tạo người dùng hệ thống' })
	@Post()
	async createUserSystem(@Req() req: Request, @Body() data: CreateUserSystemDto): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.userService.createUserSystem(sellerId, data);
	}

	@ApiBody({ type: UpdateUserSystemDto })
	@ApiOperation({ summary: 'Cập nhật người dùng hệ thống' })
	@Put(':id')
	async updateUserSystem(
		@Req() req: Request,
		@Param('id') id: number,
		@Body() data: UpdateUserSystemDto
	): Promise<void | any> {
		const { sellerId } = req['user'] as IUserAuth;
		return this.userService.updateUserSystem(req['user'], id, data);
	}

	@ApiOperation({ summary: 'Lấy danh sách người dùng hệ thống' })
	@ApiPaginatedResponse(User)
	@Get()
	async getUserSystemList(
		@Req() req: Request,
		@Query() queryParams: UserSystemQueryParamsDto
	): Promise<ResponseAbstractList<User>> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		if (isSpecialAdminByRoleCode(roleCode)) {
			return this.userService.getUserSystemListSuperAdmin(req['user'] as IUserAuth, queryParams);
		}
		return this.userService.getUserSystemList(req['user'] as IUserAuth, queryParams);
	}

	@Get(':id')
	async getUserSystemById(@Req() req: Request, @Param('id') id: number): Promise<User> {
		const { sellerId, roleCode } = req['user'] as IUserAuth;
		if (isSpecialAdminByRoleCode(roleCode)) {
			return this.userService.getUserSystemById(sellerId, id);
		}
		return this.userService.getUserSystemByIdSellerAccount(sellerId, id);
	}
}
