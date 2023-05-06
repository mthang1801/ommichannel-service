import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentDetailDto {
	@ApiProperty({ example: 1, description: 'Chỉ dùng khi cập nhật' })
	@IsOptional()
	@IsNumber()
	id: number;

	@ApiProperty({ example: 1, description: 'Id Phương thức thanh toán' })
	@IsNotEmpty()
	@IsNumber()
	payment_method_id: number;

	@ApiProperty({ example: 'Chuyển khoản', description: 'Tên phương thức thanh toán' })
	@IsOptional()
	@IsString()
	payment_method_name: string;

	@ApiProperty({ example: '2022-10-10', description: 'Ngày thanh toán, chưa thanh toán thì truyền null' })
	@IsOptional()
	@IsDateString()
	payment_at: Date;

	@ApiProperty({ example: '732189374', description: 'Mã tham chiếu' })
	@IsOptional()
	@IsString()
	payment_code: string;

	@ApiProperty({ example: 10000000, description: 'Số tiền thanh toán' })
	@IsNotEmpty()
	@IsNumber()
	amount: number;
}
