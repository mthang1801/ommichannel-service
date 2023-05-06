import { Get, Query, Req, Res } from '@nestjs/common/decorators';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ExportOrderDeliveriesListDto } from 'src/dtos/requests/exports/export-orderDelivery.dto';
import { ExportProductsListDto } from 'src/dtos/requests/exports/export-products.dto';
import { ExportService } from 'src/services/export.service';
import { cwd } from 'process';
import { CategoryService } from 'src/services/category.service';

@Controller('/exports')
@Controller('attributes')
@ApiTags('Bộ thuộc tính')
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
export class ExportController {
	constructor(private readonly exportService: ExportService, private readonly categoryService: CategoryService) {}

	@Get('product-sample')
	async exportProductSample(@Req() req: Request, @Res() res: Response) {
		const filePath = await this.exportService.exportProductSample(req['user']);
		res.download(filePath);
	}

	@Get('test')
	async test(@Req() req: Request, @Res() res: Response) {
		const user = req['user'];
		const result = await this.categoryService.getCategoryList({ status: 1 }, user);
		return result;
	}

	@Get('products')
	async exportProductsList(
		@Req() req: Request,
		@Res() res,
		@Query() queryParams: ExportProductsListDto
	): Promise<any> {
		const filePath = await this.exportService.exportProductsList(req['user'], queryParams);
		res.download(filePath);
	}

	@Get('order-deliveries')
	async exportOrderDelivery(@Req() req: Request, @Res() res, @Query() queryParams: ExportOrderDeliveriesListDto) {
		const filePath = await this.exportService.exportOrderDelivery(req['user'], queryParams);
		res.download(filePath);
	}
}
