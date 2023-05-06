import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { ServicePackageExpiryTypeEnum } from 'src/common/constants/enum';
import messages from 'src/common/constants/messages';
import { BenefitPackage } from './benefitPackage';
import { ServiceBenefitPackage } from './serviceBenefitPackage.model';

@Table({
	tableName: 'service_packages',
	underscored: true,
	timestamps: true,
	updatedAt: true,
	paranoid: true,
	indexes: [{ unique: true, fields: ['service_code'] }]
})
export class ServicePackage extends Model {
	@ApiProperty()
	@Column
	declare service_name: string;

	@ApiProperty()
	@Column({
		unique: {
			name: 'email',
			msg: messages.servicePackage.serviceCodeExist
		}
	})
	declare service_code: string;

	@ApiProperty()
	@Column
	declare description: string;

	@ApiProperty()
	@Column({ type: DataType.DOUBLE, defaultValue: 0 })
	declare price: number;

	@ApiProperty()
	@Column
	declare seller_no: number;

	@ApiProperty()
	@Column({ defaultValue: true })
	declare status: boolean;

	@ApiProperty()
	@Column
	declare store_no: number;

	@ApiProperty()
	@Column
	declare user_no: number;

	@ApiProperty()
	@Column
	declare branch_no: number;

	@ApiProperty()
	@Column({ type: DataType.INTEGER, comment: 'Hạn dùng' })
	declare expiry: number;

	@ApiProperty()
	@Column({
		type: DataType.ENUM(),
		values: Object.values(ServicePackageExpiryTypeEnum),
		defaultValue: ServicePackageExpiryTypeEnum.month,
		comment: 'Đơn vị thời gian'
	})
	declare expiry_type: string;

	@ApiProperty()
	@Column({ type: DataType.DOUBLE })
	declare price_per_branch: number;

	@ApiProperty()
	@Column
	declare image: string;

	@BelongsToMany(() => BenefitPackage, () => ServiceBenefitPackage)
	benefits: BenefitPackage[];
}
