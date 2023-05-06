import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Seller } from 'src/models/seller.model';
import { PaymentMethod } from 'src/models/paymentMethod.model';
import { Bank } from 'src/models/bank.model';
import { Province } from 'src/models/province.model';
import { District } from 'src/models/district.model';
import { Ward } from 'src/models/ward.model';
import { vietNamesePhoneValidation } from 'src/utils/functions.utils';
import { BankBranch } from 'src/models/bankBranch.model';

@Table({
	tableName: 'suppliers',
	timestamps: true,
	updatedAt: true,
	underscored: true
})
export class Supplier extends Model {
	@ForeignKey(() => Seller)
	@Column({
		allowNull: false
	})
	declare seller_id: number;

	@Column({
		type: DataType.STRING(256)
	})
	declare supplier_code: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare supplier_name: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		validate: {
			is: vietNamesePhoneValidation
		}
	})
	declare phone: string;

	@Column({
		type: DataType.STRING,
		validate: {
			is: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		},
		allowNull: true
	})
	declare email: string;

	@Column({
		type: DataType.STRING
	})
	declare fax: string;

	@Column({
		type: DataType.STRING(512)
	})
	declare website: string;

	@Column({
		defaultValue: true,
		comment: 'Trạng thái hoạt động của tài khoản. 1 : active, 0: disabled'
	})
	declare status: boolean;

	@ForeignKey(() => PaymentMethod)
	@Column
	declare payment_method_id: number;

	@ForeignKey(() => Bank)
	@Column
	declare bank_id: number;

	@ForeignKey(() => BankBranch)
	@Column
	declare bank_branch_id: number;

	@Column({
		type: DataType.STRING(128)
	})
	declare account_number: string;

	@Column({
		type: DataType.STRING(256)
	})
	declare account_name: string;

	@Column({
		type: DataType.STRING(512)
	})
	declare address: string;

	@ForeignKey(() => Province)
	@Column
	declare province_id: number;

	@ForeignKey(() => District)
	@Column
	declare district_id: number;

	@ForeignKey(() => Ward)
	@Column
	declare ward_id: number;

	@Column({
		type: DataType.STRING(12)
	})
	declare tax_code: string;

	@Column({
		defaultValue: 0
	})
	declare debt: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@BelongsTo(() => Bank)
	bank: Bank;

	@BelongsTo(() => BankBranch)
	bank_branch: BankBranch;

	@BelongsTo(() => Province)
	province: Province;

	@BelongsTo(() => District)
	district: District;

	@BelongsTo(() => Ward)
	ward: Ward;
}
