import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import {
	CodAndCarriageBillPaymentMethodEnum,
	CodAndCarriageBillStatusEnum,
	CodAndPostageBillPaymentStatusEnum
} from 'src/common/constants/enum';
import { CodAndCarriageBillLog } from 'src/models/codAndCarriageBillLog.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { Seller } from 'src/models/seller.model';
import { ShippingUnit } from 'src/models/shippingUnit.model';
import { Order } from './order.model';

@Table({
	tableName: 'cod_and_carriage_bills',
	underscored: true,
	updatedAt: true,
	timestamps: true
})
export class CodAndCarriageBill extends Model {
	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;
	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional()
	@Column({ comment: 'Mã đối soát' })
	declare bill_code: string;

	@ApiPropertyOptional()
	@ForeignKey(() => ShippingUnit)
	@Column
	declare shipping_unit_id: number;
	@BelongsTo(() => ShippingUnit)
	shipping_unit: ShippingUnit;

	@ApiPropertyOptional()
	@Column({
		defaultValue: CodAndCarriageBillStatusEnum['Đang đối soát'],
		comment: 'Trạng thái đối soát'
	})
	declare for_control_status: number;

	@ApiPropertyOptional()
	@Column({
		defaultValue: CodAndPostageBillPaymentStatusEnum['Chưa thanh toán'],
		comment: 'Trạng thái thanh toán'
	})
	declare payment_status: number;

	@ApiPropertyOptional()
	@Column({
		defaultValue: CodAndCarriageBillPaymentMethodEnum['Tiền mặt']
	})
	declare payment_method: number;

	@ApiPropertyOptional()
	@Column
	declare payment_ref_code: string;

	@ApiPropertyOptional()
	@Column({ defaultValue: 0, comment: 'Số lượng vận đơn' })
	declare quantity: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Thu hộ COD' })
	declare cod: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Phí COD' })
	declare delivery_cod_fee: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Cước phí' })
	declare shipping_fee: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Tổng tiền' })
	declare total_amount: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Tiền đã trả' })
	declare paid_amount: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DOUBLE, comment: 'Công nợ' })
	declare debit_amount: number;

	@ApiPropertyOptional()
	@Column
	declare branch_id: number;

	@ApiPropertyOptional()
	@Column
	declare branch_name: string;

	@ApiPropertyOptional()
	@Column({ type: DataType.TEXT })
	declare note: string;

	@ApiPropertyOptional()
	@Column
	@Column({ type: DataType.STRING(128), comment: 'Người đối soát' })
	declare verified_by: string;

	@ApiPropertyOptional()
	@Column({ type: DataType.DATE })
	declare verified_at: string;

	@ApiPropertyOptional()
	@Column
	@Column({ type: DataType.STRING(128), comment: 'Người thanh toán' })
	declare paid_by: string;

	@ApiPropertyOptional()
	@Column({ type: DataType.STRING(128), comment: 'Người tạo phiếu' })
	declare created_by: string;

	@ApiPropertyOptional()
	@Column
	declare updated_by: number;

	@ApiPropertyOptional()
	@Column({ type: DataType.DATE })
	declare payment_at: string;

	@HasMany(() => Order)
	orders: Order[];

	@HasMany(() => OrderDelivery)
	order_deliveries: OrderDelivery[];

	@HasMany(() => CodAndCarriageBillLog)
	logs: CodAndCarriageBillLog[];
}
