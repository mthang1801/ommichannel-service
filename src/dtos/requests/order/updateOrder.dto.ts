import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsBoolean,
	IsDateString,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator';
import { OrderDetailDto } from './orderDetail.dto';
import { PaymentDetailDto } from './paymentDetail.dto';
export class UpdateOrderDto {
	@ApiProperty({ example: 1 })
	@IsOptional()
	@IsNumber()
	platform_id: number;

	@ApiProperty({ example: 'tiki' })
	@IsOptional()
	@IsString()
	platform_name: string;

	@ApiProperty({ example: false })
	@IsOptional()
	@IsBoolean()
	receive_at_store = false;

	@ApiProperty({ example: 1 })
	@IsOptional()
	@IsNumber()
	warehouse_id: number;

	@ApiProperty({ example: 1, description: 'Id Đơn vị vận chuyển' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	shipping_unit_id: number;

	@ApiProperty({ example: 'NTL' })
	@IsOptional()
	@IsString()
	shipping_unit_name: string;

	@ApiProperty({ example: 1 })
	@ApiPropertyOptional()
	@IsOptional()
	delivery_expected_at: string;

	@ApiProperty({ example: 1 })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	delivery_service_id: number;

	@ApiProperty({ example: 'Giao tiêu chuẩn' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	delivery_service_name: string;

	@ApiProperty({ example: 'Giao tiêu chuẩn' })
	@ApiPropertyOptional()
	@IsOptional()
	delivery_payment_method_id: string;

	@ApiProperty({ example: 'Giao tiêu chuẩn' })
	@ApiPropertyOptional()
	@IsOptional()
	delivery_payment_method_name: string;

	@ApiProperty({ example: 100000, description: 'COD' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	cod: number;

	@ApiProperty({ example: 35000, description: 'Phí vận chuyển' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	shipping_fee = 0;

	@ApiProperty({ example: 'oms-coupon-code', description: 'mã Coupon' })
	@IsOptional()
	@IsString()
	coupon_code: string;

	@ApiProperty({ example: 500000, description: 'giá trị coupon' })
	@IsOptional()
	@IsNumber()
	coupon_value = 0;

	@ApiProperty({ example: 10, description: 'Tổng Khối lượng (kg)' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	weight: number;

	@ApiProperty({ example: 10, description: 'Chiều dài hàng hoá (cm)' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	length: number;

	@ApiProperty({ example: 10, description: 'Chiều rộng hàng hoá (cm)' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	width: number;

	@ApiProperty({ example: 10, description: 'Chiều cao hàng hoá (cm)' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	height: number;

	@ApiProperty({ example: 1, description: 'Yêu cầu giao hàng' })
	@ApiPropertyOptional()
	@IsOptional()
	delivery_request: string;

	@ApiProperty({ example: 1, description: 'Ghi chú giao hàng' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	delivery_note: string;

	@ApiProperty({ example: 1, description: 'Id của khách' })
	@IsOptional()
	@IsNumber()
	customer_id: number;

	@ApiProperty({ example: 'John Doe', description: 'Tên khách hàng tạo đơn' })
	@IsOptional()
	@IsString()
	b_fullname: string;

	@IsOptional()
	@ApiProperty({ example: '0987654311', description: 'Số phone KH tạo đơn' })
	@IsString()
	b_phone: string;

	@ApiProperty({
		example: 'johndoe@email.com',
		description: 'Email KH tạo đơn'
	})
	@IsOptional()
	@IsEmail()
	b_email: string;

	@ApiProperty({ example: '1990-01-01', description: 'Ngày sinh KH tạo đơn' })
	@IsOptional()
	@IsDateString()
	b_dob: Date;

	@ApiProperty({ example: 'Male', description: 'Giới tính' })
	@IsOptional()
	b_gender: string | number;

	@ApiProperty({
		example: 'Alista',
		description: 'Tên đầy đủ người nhận hàng'
	})
	@IsOptional()
	@IsString()
	s_fullname: string;

	@ApiProperty({
		example: '0907848274',
		description: 'Số phone người nhận hàng'
	})
	@IsOptional()
	@IsString()
	s_phone: string;

	@ApiProperty({
		example: 'alista@rmail.com',
		description: 'Email người nhận hàng'
	})
	@IsOptional()
	@IsEmail()
	s_email: string;

	@ApiProperty({
		example: 50,
		description: 'Id tỉnh của người nhận'
	})
	@IsOptional()
	@IsNumber()
	s_province_id: number;

	@ApiProperty({
		example: 'TP Hồ Chí Minh',
		description: 'Tên tỉnh của người nhận'
	})
	@IsOptional()
	@IsString()
	s_province: string;

	@ApiProperty({
		example: '550',
		description: 'Id quận/ huyện của người nhận'
	})
	@IsOptional()
	@IsNumber()
	s_district_id: number;

	@ApiProperty({
		example: 'Quận Tân Bình',
		description: 'tên quận/ huyện của người nhận'
	})
	@IsOptional()
	@IsString()
	s_district: string;

	@ApiProperty({
		example: 7772,
		description: 'Id phường/ xã của người nhận'
	})
	@IsOptional()
	@IsNumber()
	s_ward_id: number;

	@ApiProperty({
		example: 'Phường 4',
		description: 'Tên phường/ xã của người nhận'
	})
	@IsOptional()
	@IsString()
	s_ward: string;

	@ApiProperty({
		example: '101D Cộng Hoà',
		description: 'Địa chỉ người nhận'
	})
	@IsOptional()
	@IsString()
	s_address: string;

	@ApiProperty({
		example: 'Nhận hàng lúc 18h chiều',
		description: 'Ghi chú khách hàng'
	})
	@IsOptional()
	@IsString()
	notes: string;

	@ApiProperty({
		type: 'array',
		items: { allOf: [{ $ref: getSchemaPath(OrderDetailDto) }] },
		example: [
			{
				product_id: 4,
				product: 'iPhone 14 128GB Test',
				sku: 'iphone14-128gb-test-1',
				barcode: 'iphone14-128gb-test-1',
				price: '100',
				qty: 4,
				discount: 10,
				discount_type: '1'
			},
			{
				product_id: 8,
				product: 'iPhone 14 128GB Test',
				sku: 'iphone14-128gb-test-5',
				barcode: 'iphone14-128gb-test-1',
				price: '200',
				qty: 2,
				discount: 20,
				discount_type: '1'
			}
		]
	})
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => OrderDetailDto)
	details: OrderDetailDto[];

	@ApiProperty({
		type: 'array',
		items: { allOf: [{ $ref: getSchemaPath(PaymentDetailDto) }] },
		example: [
			{
				payment_method_id: 2,
				payment_code: 'abcd',
				amount: 10,
				payment_at: '2022-10-11 17:26:46'
			},
			{
				payment_method_id: 3,
				payment_code: 'abcde',
				amount: 20,
				payment_at: '2022-10-11 17:26:46'
			}
		]
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => PaymentDetailDto)
	payment_details: PaymentDetailDto[];

	@ApiProperty()
	@IsOptional()
	removed_details: number[] = [];

	@ApiProperty()
	@IsOptional()
	removed_payment_details: number[] = [];

	@IsOptional()
	@IsNumber()
	used_point = 0;

	@IsOptional()
	@IsNumber()
	used_point_value = 0;

	@IsOptional()
	@IsNumber()
	delivery_cod_fee = 0;
}
