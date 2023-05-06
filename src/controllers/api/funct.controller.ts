import { Controller, Get, HttpException, HttpStatus, Query, Req } from '@nestjs/common';
import { Body, Param, Post, Put } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import messages from 'src/common/constants/messages';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { CreateFunctDto } from 'src/dtos/requests/functs/createFunct.dto';
import { FunctQueryParams } from 'src/dtos/requests/functs/functQueryParams.dto';
import { UpdateFunctDto } from 'src/dtos/requests/functs/updateFunct.dto';
import { UpdateFunctsIndexesDto } from 'src/dtos/requests/functs/updateFunctPosition.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Funct } from 'src/models/funct.model';
import { FunctService } from 'src/services/funct.service';
import { ApiCreatedResponseExtra } from 'src/swagger/apiCreatedResponse.dto';
import { ApiUpdateResponseExtra } from 'src/swagger/apiUpdateResponse.dto';

@Controller('functs')
@ApiTags('Functions')
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
export class FunctController {
	constructor(private readonly functService: FunctService) {}

	@Post()
	@ApiCreatedResponseExtra()
	@ApiOperation({ summary: 'Tạo Function' })
	@ApiBody({ type: CreateFunctDto })
	async createFunct(@Req() req: Request, @Body() data: CreateFunctDto): Promise<void> {
		const { roleCode } = req['user'] as IUserAuth;
		if (!isSpecialAdminByRoleCode(roleCode))
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		await this.functService.createFunct(data);
	}

	@Put('update-indexes')
	@ApiOperation({ summary: 'Cập nhật Function' })
	@ApiBody({ type: UpdateFunctsIndexesDto })
	@ApiUpdateResponseExtra()
	async updateIndexes(@Req() req: Request, @Body() data: UpdateFunctsIndexesDto): Promise<void> {
		const { roleCode } = req['user'] as IUserAuth;
		if (!isSpecialAdminByRoleCode(roleCode))
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		await this.functService.updateIndexes(data);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Cập nhật Function' })
	@ApiBody({ type: UpdateFunctDto })
	@ApiUpdateResponseExtra()
	async updateFunct(@Param('id') id: number, @Req() req: Request, @Body() data: UpdateFunctDto): Promise<void> {
		console.log(69);
		const { roleCode } = req['user'] as IUserAuth;
		if (!isSpecialAdminByRoleCode(roleCode))
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		await this.functService.updateFunct(id, data);
	}

	@Get('/all-functs')
	@ApiOperation({ summary: 'Lấy tất cả các Function' })
	async getAllFuncts(@Req() req: Request): Promise<Funct[]> {
		const nested = true;
		const functResult = await this.functService.getAllFuncts(req['user'], nested);

		return functResult.data;
	}

	@Get()
	@ApiOperation({ summary: 'Lấy các Function được filter' })
	async getFuncts(@Req() req: Request, @Query() queryParams: FunctQueryParams): Promise<{ data: Funct[] }> {
		const { roleId, roleCode } = req['user'];
		if (!isSpecialAdminByRoleCode(roleCode))
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		return this.functService.getFuncts(queryParams);
	}

	@Get(':id')
	async getFunctById(@Req() req: Request, @Param('id') id: number, @Query() queryParams): Promise<Funct> {
		const { roleCode } = req['user'] as IUserAuth;
		if (!isSpecialAdminByRoleCode(roleCode))
			throw new HttpException(messages.roles.forbidenRole, HttpStatus.FORBIDDEN);
		return this.functService.getFunctById(id);
	}

	@Get(':id/children')
	async getFunctsChildren(
		@Req() req: Request,
		@Query() queryParams: FunctQueryParams,
		@Param('id') id: number
	): Promise<ResponseAbstractList<Funct>> {
		const { roleCode } = req['user'] as IUserAuth;
		return this.functService.getFunctsChildren(id, queryParams);
	}
}
