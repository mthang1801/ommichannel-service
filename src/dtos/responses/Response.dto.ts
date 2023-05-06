import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from 'src/dtos/page.dto';

export class ResponseDto<statusCode, data> {
	@ApiProperty()
	status: 'success';

	@ApiProperty()
	statusCode: statusCode;

	@ApiProperty()
	paging?: PageDto;

	@ApiProperty()
	data: data;

	@ApiProperty()
	message: any;
}
