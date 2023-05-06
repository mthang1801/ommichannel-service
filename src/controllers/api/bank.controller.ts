import { Controller, Get, Query } from '@nestjs/common/decorators';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { Bank } from 'src/models/bank.model';
import { BankService } from 'src/services/bank.service';
import { BankBranch } from 'src/models/bankBranch.model';
import { ApiTags, ApiBearerAuth, ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/swagger/apiPaginatedResponse.dto';

@Controller('banks')
@ApiTags('Ngân hàng')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		description: 'Access Token',
		example: 'accessToken',
		required: true
	},
	{
		name: 'x-auth-uuid',
		example: 'xAuthUUID',
		required: true
	},
	{
		name: 'Content-Type',
		example: 'application/json'
	}
])
export class BankController {
	constructor(private readonly bankService: BankService) {}

	@SkipAuth()
	@ApiOperation({ summary: 'Lấy danh sách ngân hàng' })
	@ApiPaginatedResponse(Bank)
	@Get()
	async getBankList(@Query() queryParams): Promise<ResponseAbstractList<Bank>> {
		return this.bankService.getBankList(queryParams);
	}

	@ApiOperation({ summary: 'Lấy danh sách chi nhánh của ngân hàng' })
	@ApiPaginatedResponse(BankBranch)
	@SkipAuth()
	@Get('branchs')
	async getBankBranchList(@Query() queryParams): Promise<ResponseAbstractList<BankBranch>> {
		return this.bankService.getBankBranchList(queryParams);
	}
}
