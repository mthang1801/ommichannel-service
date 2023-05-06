import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { ServiceBenefitPackage } from './serviceBenefitPackage.model';
import { ServicePackage } from './servicePackage.model';

@Table({ tableName: 'benefit_packages', underscored: true, timestamps: true, paranoid: true })
export class BenefitPackage extends Model {
	@Column
	declare benefit_name: string;

	@Column
	declare description: string;

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	declare is_default: boolean;

	@BelongsToMany(() => ServicePackage, () => ServiceBenefitPackage)
	packages: ServicePackage[];
}
