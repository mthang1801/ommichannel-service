import { BelongsTo, Column, ForeignKey, Model, Table, DataType } from 'sequelize-typescript';
import { ProductLog } from './productLog.model';

@Table({ tableName: 'product_log_details', timestamps: false, underscored: true })
export class ProductLogDetail extends Model {
	@ForeignKey(() => ProductLog)
	@Column
	declare product_log_id: number;

	@BelongsTo(() => ProductLog)
	product_log: string;

	@Column
	field_name: string;

	@Column({ type: DataType.TEXT })
	old_data_value: string;

	@Column({ type: DataType.TEXT })
	new_data_value: string;
}
