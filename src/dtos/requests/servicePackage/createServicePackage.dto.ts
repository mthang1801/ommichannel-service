import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServicePackageExpiryTypeEnum } from 'src/common/constants/enum';

export class CreateServicePackageDto {
	@ApiProperty({ description: 'Tên gói DV' })
	@IsNotEmpty()
	service_name: string;

	@ApiProperty({ description: 'Mã gói DV' })
	@IsNotEmpty()
	service_code: string;

	@ApiProperty({ description: 'Mô tả' })
	@IsOptional()
	description: string;

	@ApiProperty({ description: 'Giá gói DV' })
	@IsNotEmpty()
	price: number;

	@ApiProperty({ description: 'Trạng thái hoạt động' })
	@IsOptional()
	status: boolean;

	@ApiPropertyOptional({ description: 'Số cửa hàngs' })
	@IsOptional()
	store_no: number;

	@ApiPropertyOptional({ description: 'Số người dùng' })
	@IsOptional()
	user_no: number;

	@ApiPropertyOptional({ description: 'Số chi nhánh' })
	@IsOptional()
	branch_no: number;

	@ApiPropertyOptional({ description: 'Thời hạn' })
	@IsOptional()
	expiry: number;

	@ApiPropertyOptional({ description: 'Kiểu hạn tg year/month/day' })
	@IsOptional()
	@IsEnum(ServicePackageExpiryTypeEnum)
	expiry_type: ServicePackageExpiryTypeEnum;

	@ApiPropertyOptional({ description: 'Tạo hình ảnh' })
	@IsOptional()
	@IsString()
	image: string;

	@ApiPropertyOptional({ description: 'số lượng kho' })
	@IsOptional()
	@IsString()
	price_per_branch: string;

	@ApiPropertyOptional({ description: 'Đặc quyền của gói' })
	@IsOptional()
	@IsArray()
	benefits: number[] = [];
}
