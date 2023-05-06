import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRolesDto {
	@ApiProperty()
	@IsNotEmpty({message: "Tên nhóm không được để trống"})
	@Transform(({ value }) => value.trim())	
	role_name: string;

	@ApiProperty()
	@IsOptional()
	status: boolean = true;

	@ApiProperty()
	@IsOptional()
	@IsArray()
	funct_ids: number[] = [];
}
