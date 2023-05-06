import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PromotionStatusEnum } from 'src/common/constants/enum';
import { Category } from './category.model';
import { Product } from './product.model';
import { PromotionProgramEntity } from './promotionProgramEntities.model';
import { Seller } from './seller.model';

@Table({
	tableName: 'promotions',
	underscored: true,
	timestamps: true,
	updatedAt: true,
	paranoid: true,
	indexes: [
		{
			type: 'UNIQUE',
			fields: ['seller_id', 'program_code']
		}
	]
})
export class PromotionProgram extends Model {
	@ForeignKey(() => Seller)
	declare seller_id: number;

	@BelongsTo(() => Seller)
	declare seller: Seller;

	@ApiPropertyOptional({ description: 'Mã chương trình' })
	@Column({ comment: 'Mã chương trình' })
	declare program_code: string;

	@ApiPropertyOptional({ description: 'Tên chương trình' })
	@Column({ comment: 'Tên chương trình' })
	declare program_name: string;

	@ApiPropertyOptional({ description: 'Mô tả chương trình' })
	@Column({ type: DataType.TEXT, comment: 'Mô tả chương trình' })
	declare description: string;

	@ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
	@Column({ comment: 'Trạng thái hoạt động', defaultValue: PromotionStatusEnum['Chưa kích hoạt'] })
	declare status: number;

	@ApiPropertyOptional({ description: 'Tổng KM' })
	@Column
	declare max_use_quantity: number;

	@ApiPropertyOptional({ description: 'Số lượng đã sử dụng' })
	@Column({ defaultValue: 0 })
	declare used_quantity: number;

	@ApiPropertyOptional({ description: 'Tổng Giá trị KM' })
	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare total_promotion_price: number;

	@ApiPropertyOptional({ description: 'Phương thức áp dụng' })
	@Column
	declare apply_method: number;

	@ApiPropertyOptional({ description: 'Áp dụng cho tất cả SP' })
	@Column({ comment: 'Áp dụng cho tất cả SP', defaultValue : false })
	declare apply_all_products : boolean;

	@ApiPropertyOptional({ description: 'Nguồn đơn hàng' })
	@Column
	declare utm_sources: string;

	@ApiPropertyOptional({ description: '' })
	@Column
	declare customer_rankings: string;

	@ApiPropertyOptional({ description: 'Ngày bắt đầu' })
	@Column({ type: DataType.DATE, comment: 'Ngày bắt đầu' })
	declare start_date: string;

	@ApiPropertyOptional({ description: 'Ngày kết thúc' })
	@Column({ type: DataType.DATE, comment: 'Ngày kết thúc' })
	declare end_date: string;

	@ApiPropertyOptional({ description: 'Thời gian bắt đầu' })
	@Column({ type: DataType.TIME, comment: 'Thời gian bắt đầu' })
	declare start_at: string;

	@ApiPropertyOptional({ description: 'Thời gian kết thúc' })
	@Column({ type: DataType.TIME, comment: 'Thời gian kết thúc' })
	declare end_at: string;

	@ApiPropertyOptional({ description: 'Thứ trong tuần' })
	@Column({ comment: 'Thứ trong tuần' })
	declare days_of_week: string;

	@ApiPropertyOptional({ description: 'Tháng trong năm' })
	@Column({ comment: 'Tháng trong năm' })
	declare months_of_year: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ comment: 'Ngày trong tháng' })
	declare days_of_month: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ type: DataType.TEXT, comment: 'Áp dụng vào những Ngày' })
	declare include_dates: string;

	@ApiPropertyOptional({ description: 'Ngày trong tháng' })
	@Column({ type: DataType.TEXT, comment: 'Không Áp dụng vào những Ngày' })
	declare not_include_dates: string;

	@ApiPropertyOptional({ description: 'Người tạo' })
	@Column({ comment: 'Người tạo' })
	declare created_by: number;

	@ApiPropertyOptional({ description: 'Người cập nhật' })
	@Column({ comment: 'Người cập nhật' })
	declare updated_by: number;

	@HasMany(() => PromotionProgramEntity)
	entities: PromotionProgramEntity[];
}
