import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { CustomerHistoryPointOperatorEnum } from 'src/common/constants/enum';
import { Customer } from './customer.model';
import { Seller } from './seller.model';

@Table({ tableName: 'customer_point_histories', underscored: true, timestamps: true })
export class CustomerPointHistory extends Model {
	@ApiPropertyOptional({ description: 'Customer Id' })
	@ForeignKey(() => Customer)
	@Column({ comment: 'Customer id' })
	declare customer_id: number;

	@BelongsTo(() => Customer)
	customer: Customer;

	@ApiPropertyOptional({ description: 'Seller Id' })
	@ForeignKey(() => Seller)
	@Column({ comment: 'Seller id' })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ description: 'Kiểu Toán tử' })
	@Column({ comment: 'Kiểu Toán tử 1: Tích điểm, 2: Tiêu điểm', defaultValue: CustomerHistoryPointOperatorEnum.add })
	declare type_operator: number;

	@ApiPropertyOptional({ description: 'Số điểm' })
	@Column({ comment: 'Số điểm', defaultValue: 0 })
	declare point_value: number;

	@ApiPropertyOptional({ description: 'Số tiền tương ứng với số điểm (áp dụng cho tiêu điểm)' })
	@Column({ comment: 'Số tiền tương ứng với số điểm (áp dụng cho tiêu điểm)', defaultValue: 0 })
	declare corresponding_amount: number;

	@ApiPropertyOptional({ description: 'Id tham chiếu' })
	@Column({ comment: 'Id tham chiếu' })
	declare ref_id: number;

	@ApiPropertyOptional({ description: 'Nguồn tham chiếu' })
	@Column({ comment: 'Nguồn tham chiếu (đơn hàng, hoá đơn, sự kiện...)' })
	declare ref_source: number;

	@ApiPropertyOptional({ description: 'Mô tả' })
	@Column({ comment: 'Mô tả', type: DataType.TEXT })
	declare description: string;
}
