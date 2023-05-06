import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponse {
	@ApiProperty({ type: String, default: 'fail' })
	status: 'success';

	@ApiProperty({ type: Number, default: 400 })
	statusCode: 400;

	@ApiProperty()
	data: any;

	@ApiProperty({ type: String, default: 'có lỗi xảy ra.' })
	message: any;
}
