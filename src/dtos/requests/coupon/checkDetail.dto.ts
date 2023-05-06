import { IsNotEmpty, IsString } from 'class-validator';
export class CheckDetailDto {
	@IsNotEmpty()
	@IsString()
	coupon_detail_code: string;
}
