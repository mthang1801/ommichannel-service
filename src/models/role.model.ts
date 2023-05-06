import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BelongsTo, BelongsToMany, Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Funct } from 'src/models/funct.model';
import { RoleFunct } from 'src/models/roleFunc.model';
import { Seller } from 'src/models/seller.model';
import { UserRole } from 'src/models/userRole.model';

@Table({ timestamps: true, updatedAt: true, underscored: true })
export class Role extends Model {
	@ApiPropertyOptional({ example: null })
	@Column
	declare parent_id: number;

	@ApiPropertyOptional({ example: true })
	@Column({ defaultValue: true })
	declare status: boolean;

	@ApiPropertyOptional({ example: 'Quản lý content' })
	@Column({ allowNull: false })
	declare role_name: string;

	@ApiPropertyOptional({ example: 'Content-Managerment' })
	@Column({ allowNull: false })
	declare role_code: string;

	@ApiPropertyOptional({ example: 0 })
	@Column({ defaultValue: 0 })
	declare level: number;

	@ForeignKey(() => Seller)
	@ApiPropertyOptional({ example: 5 })
	@Column({ allowNull: false })
	declare seller_id: number;

	@BelongsTo(() => Seller)
	seller: Seller;

	@ApiPropertyOptional({ example: 4 })
	@Column
	declare created_by: number;

	@ApiPropertyOptional({ example: 4 })
	@Column
	declare updated_by: number;

	@BelongsToMany(() => Funct, () => RoleFunct)
	functs: Funct[];

	@HasMany(() => UserRole)
	userRoles: UserRole[];
}
