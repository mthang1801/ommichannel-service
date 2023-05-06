import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateAttributeStatusDto {
	@ApiProperty()
	@IsBoolean()
	@IsNotEmpty()
	status: boolean;
}
