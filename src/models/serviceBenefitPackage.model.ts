import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { BenefitPackage } from './benefitPackage';
import { ServicePackage } from './servicePackage.model';

@Table({ tableName: 'service_benefits_packages', underscored: true, timestamps: false })
export class ServiceBenefitPackage extends Model {
	@ForeignKey(() => ServicePackage)
	@Column
	declare service_id: number;

	@ForeignKey(() => BenefitPackage)
	@Column
	declare benefit_id: number;
}
