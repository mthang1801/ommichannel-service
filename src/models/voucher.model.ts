import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';

@Table({
	tableName: 'vouchers',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Voucher extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;
	@BelongsTo(() => Seller)
	seller: Seller;

	@Column({
		allowNull: false,
		type: DataType.STRING(18)		
	})
	declare voucher_code: string;

	@Column({
		allowNull: false,
		type: DataType.STRING(255)
	})
	declare voucher_name: string;

	@Column({
		allowNull: false,
		defaultValue: 1,
		type: DataType.INTEGER.UNSIGNED
	})
	declare amount: number;

	@Column({
		type: DataType.TEXT
	})
	declare description: string;

	@Column({
		allowNull: false,
		defaultValue: 1,
		comment: 'Loại mã giảm giá: 1. Giảm theo số tiền, 2. Giảm theo %'
	})
	declare type: number;

	@Column({
		allowNull: false,
		defaultValue: 0,
		comment: 'Mức giảm'
	})
	declare discount: number;

	@Column({
		allowNull: false,
		defaultValue: 0,
		comment: 'Áp dụng cho đơn hàng giá trị tối thiểu'
	})
	declare min_order_value: number;

	@Column({
		comment: 'Mức giảm giá tối đa'
	})
	declare max_discount: number;

	@Column({
		allowNull: false,
		defaultValue: true
	})
	declare status: boolean;

	@Column({
		type: DataType.DATE
	})
	declare start_at: string;

	@Column({
		type: DataType.DATE
	})
	declare stop_at: string;
}
