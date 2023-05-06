import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../swagger/apiPaginatedResponse.dto';
import { CouponService } from 'src/services/coupon.service';
import { CreateCouponDto } from 'src/dtos/requests/coupon/createCoupon.dto';
import { Coupon } from 'src/models/coupon.model';
import { CouponQueryParamsDto } from 'src/dtos/requests/coupon/couponQueryParams.dto';
import { CheckDetailDto } from 'src/dtos/requests/coupon/checkDetail.dto';
import { UpdateCouponDto } from 'src/dtos/requests/coupon/updateCoupon.dto';
import { GenCouponDetailCodeDto } from 'src/dtos/requests/coupon/genCouponDetailCode.dto';
import { UpdateStatusCouponListDto } from 'src/dtos/requests/coupon/updateStatusCouponList.dto';
import { ApplyCouponDto } from 'src/dtos/requests/coupon/applyCoupon.dto';
import { ApplyCouponSuccessDto } from 'src/dtos/requests/coupon/applyCouponSuccess.dto';

@Controller('coupons')
@ApiTags('Chương trình mã giảm giá')
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
export class CouponController {
	constructor(private readonly couponService: CouponService) {}

	@ApiBody({ type: CreateCouponDto })
	@ApiOperation({ summary: 'Tạo chương trình mã giảm giá' })
	@Post()
	async createCoupon(@Req() req: Request, @Body() data: CreateCouponDto): Promise<void | any> {
		return this.couponService.createCoupon(data, req['user']);
	}

	@Post('check-detail')
	async checkDetail(@Body() data: CheckDetailDto): Promise<any> {
		return this.couponService.checkDetail(data);
	}

	@ApiBody({ type: UpdateStatusCouponListDto })
	@ApiOperation({ summary: 'Cập nhật chương trình mã giảm giá' })
	@Put('change-status')
	async updateStatusCouponList(@Req() req: Request, @Body() data: UpdateStatusCouponListDto): Promise<any> {
		return this.couponService.updateStatusCouponList(req['user'], data);
	}

	@ApiBody({ type: ApplyCouponDto })
	@Post('apply-coupon')
	async applyCoupon(@Req() req: Request, @Body() data: ApplyCouponDto): Promise<any> {
		return this.couponService.applyCoupon(req['user'], data);
	}

	@ApiBody({ type: ApplyCouponSuccessDto })
	@Post('apply-coupon-success')
	async applyCouponSuccess(@Req() req: Request, @Body() data: ApplyCouponSuccessDto): Promise<any> {
		return this.couponService.applyCouponSuccess(req['user'], data);
	}

	@ApiBody({ type: UpdateCouponDto })
	@ApiOperation({ summary: 'Cập nhật chương trình mã giảm giá' })
	@Put(':id')
	async updateCoupon(@Req() req: Request, @Param('id') id: number, @Body() data: UpdateCouponDto): Promise<any> {
		return this.couponService.updateCoupon(req['user'], id, data);
	}

	@ApiOperation({ summary: 'Lấy danh sách chương trình mã giảm giá' })
	@ApiPaginatedResponse(Coupon)
	@Get()
	async getCouponList(
		@Req() req: Request,
		@Query() queryParams: CouponQueryParamsDto
	): Promise<ResponseAbstractList<Coupon>> {
		const { sellerId } = req['user'];
		return this.couponService.getCouponList(sellerId, queryParams);
	}

	@Get('coupon-code')
	async getCouponProgramCode(@Req() req: Request): Promise<any> {
		const { sellerId } = req['user'];
		return this.couponService.getCouponProgramCode(sellerId);
	}

	@Post('coupon-detail-codes')
	async getCouponDetailCode(@Req() req: Request, @Body() data: GenCouponDetailCodeDto): Promise<any> {
		const { sellerId } = req['user'];
		return this.couponService.getCouponDetailCode(data);
	}

	@ApiOperation({ summary: 'Lấy chi tiết chương trình mã giảm giá' })
	@Get(':id')
	async getCouponById(@Param('id') id: number): Promise<Coupon> {
		return this.couponService.getCouponById(id);
	}
}
