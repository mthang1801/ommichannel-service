import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { CreateServicePackageDto } from 'src/dtos/requests/servicePackage/createServicePackage.dto';
import { GetServicePackagesListDto } from 'src/dtos/requests/servicePackage/getServicePackagesList.dto';
import { UpdateServicePackageDto } from 'src/dtos/requests/servicePackage/updateServicePacakge.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { BenefitPackage } from 'src/models/benefitPackage';
import { ServicePackage } from 'src/models/servicePackage.model';
import { ServicePackageService } from 'src/services/servicePackage.service';

@Controller('service-packages')
@ApiTags('Gói dịch vụ')
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
export class ServicePackageController {
	constructor(private readonly servicePackageService: ServicePackageService) {}

	@ApiOperation({ summary: 'danh sách các gói quyền lợi' })
	@SkipAuth()
	@Get('benefits')
	async getAllBenefits(): Promise<BenefitPackage[]> {
		return this.servicePackageService.getAllBenefits();
	}

	@SkipAuth()
	@ApiOperation({ summary: 'Xem danh sách gói dịch vụ' })	
	@Get()
	async getServicePackagesList(
		@Query() queryParams : GetServicePackagesListDto
	): Promise<ResponseAbstractList<ServicePackage>> {
		return await this.servicePackageService.getServicePackagesList(queryParams);
	}
	
	@ApiOperation({ summary: 'Tạo gói dịch vụ' })
	@ApiBody({ type: CreateServicePackageDto })
	@Post()
	async createServicePackage(@Body() data: CreateServicePackageDto, @Req() req: Request): Promise<void> {
		await this.servicePackageService.createServicePackage( data);
	}

	@ApiOperation({ summary: 'Cập nhật gói dịch vụ' })
	@ApiBody({ type: CreateServicePackageDto })
	@Put(':id')
	async updateServicePackage(
		@Param('id') id: number,
		@Body() data: UpdateServicePackageDto,
		@Req() req: Request
	): Promise<void> {
		await this.servicePackageService.updateServicePackage(id, data);
	}
	
	@ApiOperation({ summary: 'Xem chi tiết gói dịch vụ' })	
	@Get(':id')
	async getServicePackage(
		@Param('id') id: number
	): Promise<ServicePackage> {
		return await this.servicePackageService.getServicePackage(id);
	}
	

}
