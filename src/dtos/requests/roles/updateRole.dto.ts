import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class UpdateRoleGroupDto {
	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	role_name: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	status: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	funct_ids: number[];
}
