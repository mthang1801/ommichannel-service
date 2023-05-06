import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { Seller } from './seller.model';
import { ServicePackage } from './servicePackage.model';

@Table({ tableName: 'seller_service_packages', underscored: true, timestamps: true, updatedAt: true, paranoid: true })
export class SellerServicePackage extends Model {
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;

	@ForeignKey(() => ServicePackage)
	@Column
	declare service_package_id: number;

	@BelongsTo(() => ServicePackage)
	service_package : ServicePackage

	@Column({ type: DataType.DOUBLE, comment: 'Tổng tiền tạm tính', defaultValue: 0 })
	declare temp_total_money_amount: number;

	@Column({ type: DataType.DOUBLE, comment: 'Tổng tiền cuối cùng', defaultValue: 0 })
	declare final_total_money_amount: number;

	@Column({ comment: 'Số tháng', defaultValue: 1 })
	declare number_of_months: number;

	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare discount_amount: number;

	@Column({ type: DataType.TINYINT, defaultValue: 1 })
	declare discount_type: number;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare status: boolean;

	@Column
	declare created_by: number;

	@Column
	declare updated_by: number;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	declare start_at: Date;

	@Column({ type: DataType.DATE })
	declare end_at: Date;
}
