import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenSourceDto {
	@ApiProperty({ type: String, default: 'fail' })
	status: 'success';

	@ApiProperty({ type: Number, default: 403 })
	statusCode: 403;

	@ApiProperty()
	data: any;

	@ApiProperty({ type: String, default: 'Forbidden resource' })
	message: any;
}
