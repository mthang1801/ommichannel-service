import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from './seller.model';

@Table({ tableName: 'customer_point_configs', underscored: true, timestamps: true, updatedAt: true })
export class CustomerPointConfig extends Model {
	@ApiPropertyOptional({ description: 'Seller Id' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Seller Id' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Tên chương trình' })
	@Column({ comment: 'Tên chương trình' })
	declare point_name: string;

	@ApiPropertyOptional({ description: 'Mô tả' })
	@Column({ comment: 'Mô tả' })
	declare description: string;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ defaultValue: true, comment: 'Trạng thái hoạt động' })
	declare status: boolean;

	@ApiPropertyOptional({ description: 'Tỉ lệ tích điểm (Số tiền ứng với số điểm accumulated_point)' })
	@Column({ type: DataType.DOUBLE, comment: 'Tỉ lệ tích điểm (Số tiền ứng với số điểm accumulated_point)' })
	declare accumulated_money: number;

	@ApiPropertyOptional({ description: 'Số điểm tích được tương ứng với số tiền accumulated_money' })
	@Column({ type: DataType.DOUBLE, comment: 'Số điểm tích được tương ứng với số tiền accumulated_money' })
	declare accumulated_point: number;

	@ApiPropertyOptional({ description: 'Tỉ lệ tiêu điểm (Số điểm)', example: 1 })
	@Column({ type: DataType.DOUBLE, comment: 'Tỉ lệ tiêu điểm (Số điểm)' })
	declare used_money: number;

	@ApiPropertyOptional({
		description: 'Tỉ lệ tiêu điểm (Só tiền tương ứng với số điểm point_to_money)',
		example: 1000
	})
	@Column({ type: DataType.DOUBLE, comment: 'Tỉ lệ tiêu điểm (Só tiền tương ứng với số điểm point_to_money)' })
	declare used_point: number;

	@ApiPropertyOptional({ description: 'Một lần tiêu điểm tích lũy cần sử dụng tối thiểu' })
	@Column({ type: DataType.DOUBLE, comment: 'Một lần tiêu điểm tích lũy cần sử dụng tối thiểu' })
	declare min_point: number;

	@ApiPropertyOptional({ description: 'Một lần tiêu điểm tích lũy chỉ được sử dụng tối đa' })
	@Column({ type: DataType.DOUBLE, comment: 'Một lần tiêu điểm tích lũy chỉ được sử dụng tối đa' })
	declare max_point: number;

	@ApiPropertyOptional({ description: 'Tự động tiêu điểm khi khách hàng có từ' })
	@Column({ type: DataType.DOUBLE, comment: 'Tự động tiêu điểm khi khách hàng có từ' })
	declare auto_point_from: number;

	@ApiPropertyOptional({ description: 'Làm tròn xuống điểm tích lũy' })
	@Column({ defaultValue: false, comment: 'Làm tròn xuống điểm tích lũy' })
	declare point_round_to_down: boolean;

	@ApiPropertyOptional({ description: 'Xác minh sử dụng điểm tích lũy qua SMS' })
	@Column({ defaultValue: false, comment: 'Xác minh sử dụng điểm tích lũy qua SMS' })
	declare sms_verify_point: boolean;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@Column({ type: DataType.DATE, comment: 'Ngày bắt đầu' })
	declare start_at: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@Column({ type: DataType.DATE, comment: 'Ngày kết thúc' })
	declare end_at: string;

	@ApiPropertyOptional({ description: 'Người tạo ct' })
	@Column({ comment: 'Người tạo ct' })
	declare created_by: string;

	@ApiPropertyOptional({ description: 'Người cập nhật ct' })
	@Column({ comment: 'Người cập nhật ct' })
	declare updated_by: string;
}
