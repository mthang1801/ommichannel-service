import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CalcShippingFeeDto {
	@ApiProperty({ description: 'id của đơn vị vận chuyển', example: 1 })
	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsNumber()
	shipping_unit_id: number;

	@ApiProperty({ description: 'id của đối tác', example: 116586 })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	partner_id: number;

	@ApiProperty({ description: 'tổng tiền thanh toán', example: 100000000 })
	@IsNumber()
	@IsNotEmpty()
	cod_amount: number;

	@ApiProperty({
		description: 'Width of Package in Total (Measured in cm,Default 0)',
		example: 10
	})
	@IsNumber()
	@IsNotEmpty()
	weight: number;

	@ApiProperty({
		description: 'Phương thức thanh toán'
	})
	@IsNumber()
	@IsNotEmpty()
	payment_method_id: number;

	@ApiProperty({
		description: 'Tỉnh/thành của người gửi (id hoặc tên)',
		example: 'TP Hồ Chí Minh'
	})
	@IsString()
	@IsNotEmpty()
	s_province: string;

	@ApiProperty({
		description: 'Quận/huyện của người gửi (id hoặc tên)',
		example: 'Quận Gò Vấp'
	})
	@IsString()
	@IsNotEmpty()
	s_district: string;

	@ApiProperty({
		description: 'Tỉnh/thành của người nhận (id hoặc tên)',
		example: 'TP Hồ Chí Minh'
	})
	@IsString()
	@IsNotEmpty()
	r_province: string;

	@ApiProperty({
		description: 'Quạn/huyện của người nhận (id hoặc tên)',
		example: 'Quận Bình Thạnh'
	})
	@IsString()
	@IsNotEmpty()
	r_district: string;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	service_id: number;
}
