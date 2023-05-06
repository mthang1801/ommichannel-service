import { ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, Column, ForeignKey, Model, Table, DataType } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { CodAndCarriageBill } from 'src/models/codAndCarriageBill.model';

@Table({
	tableName: 'cod_and_carriage_bill_logs',
	underscored: true,
	updatedAt: true,
	timestamps: true
})
export class CodAndCarriageBillLog extends Model {
	@ApiPropertyOptional({ example: 1 })
	@ForeignKey(() => Seller)
	@Column
	declare seller_id: number;
	@BelongsTo(() => Seller)
	seller: Seller;

	@ForeignKey(() => CodAndCarriageBill)
	@Column
	declare cod_and_carriage_bill_id: number;
	@BelongsTo(() => CodAndCarriageBill)
	cod_and_carriage_bill: CodAndCarriageBill;

	@Column
	declare action_status: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare action_by: string;
}
