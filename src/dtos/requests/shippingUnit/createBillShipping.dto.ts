import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CargoTypeEnum } from 'src/common/constants/enum';
import { shippingUnitConfig } from 'src/configs/configs';
import { IShippingUnitNTLOrderCreate } from 'src/interfaces/shippingUnitData.interface';
import { Order } from 'src/models/order.model';

export class CreateBillShippingNTLDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	shipping_unit_id: number;

	@ApiProperty({ description: 'ID of partner' })
	@IsNotEmpty()
	@IsNumber()
	partner_id;

	@ApiProperty({
		description: "Customer's Reference Code - might be Invoice No or Purchase Order No"
	})
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	ref_code: string;

	@ApiProperty({ description: 'Number or Packages (Default 1)' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	package_no: number;

	@ApiProperty({
		description: 'Estimated Weight of packages measured by client'
	})
	@IsNumber()
	@IsNotEmpty()
	weight: number;

	@ApiProperty({
		description: 'Width of Package in Total (Measured in cm,Default 0)'
	})
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	width: number;

	@ApiProperty()
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	length: number;

	@ApiProperty({
		description: 'Height of Package in Total (Measured in cm,Default 0)'
	})
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	height: number;

	@ApiProperty({ description: 'Breif description of Package Product Items' })
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	cargo_content: string;

	@ApiProperty({ description: 'Breif description of Package Product Items' })
	@IsNotEmpty()
	@IsNumber()
	service_id: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	payment_method_id: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	cod_amount: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	note: string;

	@ApiProperty({ description: 'Giá trị hàng hoá' })
	@IsOptional()
	@IsNumber()
	cargo_value: number;

	@ApiProperty({
		description: 'Breif ID of Package Product Items. Define in Master Data sheet'
	})
	@IsNotEmpty()
	@IsNumber()
	cargo_type_id: number;

	@ApiProperty({ description: 'Fullname of sender' })
	@IsNotEmpty()
	@IsString()
	s_name: string;

	@ApiProperty({ description: 'Sender contact phone number' })
	@IsNotEmpty()
	@IsString()
	s_phone: string;

	@ApiProperty({
		description: 'Full address of sender',
		example: '52A Nguyễn Thái Bình, Phường 4, Quận Tân Bình, Hồ Chí Minh'
	})
	@IsNotEmpty()
	@IsString()
	s_address: string;

	@ApiProperty({ description: 'Fullname of receiver' })
	@IsNotEmpty()
	@IsString()
	r_name: string;

	@ApiProperty({ description: 'Receiverr contact phone number' })
	@IsNotEmpty()
	@IsString()
	r_phone: string;

	@ApiProperty({
		description:
			'Full address of receiver  (should be format: 52A Nguyễn Thái Bình, Phường 4, Quận Tân Bình, Hồ Chí Minh)'
	})
	@IsNotEmpty()
	@IsString()
	r_address: string;

	@ApiProperty({ description: 'Email address of receiver' })
	@IsOptional()
	@IsString()
	r_email: string;

	static getBillShippingPayloadData(partnerId: number, order: Order): IShippingUnitNTLOrderCreate {
		return {
			partner_id: partnerId,
			ref_code: order.order_code,
			package_no: 1,
			weight: order.weight,
			width: order.width,
			lenth: order.length,
			height: order.height,
			cargo_content: order.details
				.map((orderDetail) => `${orderDetail.product_name} - ${orderDetail.sku} - ${orderDetail.barcode}`)
				.join('\n'),
			service_id: order.delivery_service_id,
			payment_method_id: /* 10 || */ order.delivery_payment_method_id,
			is_return_doc: 0,
			cod_amount: order.cod,
			note: order.notes,
			cargo_value: order.temp_total_money_amount,
			cargo_type_id: CargoTypeEnum.Goods,
			s_name: order.warehouse.warehouse_name,
			s_phone: order.warehouse.phone,
			s_address: [
				order.warehouse.address,
				order.warehouse.ward_name,
				order.warehouse.district_name,
				order.warehouse.province_name
			]
				.filter(Boolean)
				.join(', '),
			r_name: order.s_fullname,
			r_phone: order.s_phone,
			r_address: [order.s_address, order.s_ward, order.s_district, order.s_province].filter(Boolean).join(', '),
			r_email: order.b_email,
			utm_source: shippingUnitConfig.NTL.utm_source
		};
	}
}
