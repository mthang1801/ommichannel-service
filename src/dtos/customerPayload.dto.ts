import { CustomerTypeEnum } from 'src/common/constants/enum';
import { CustomerAddress } from './requests/customer/customerAddress.dto';

export class CustomerPayloadDto {
	fullname: string;

	email?: string;

	phone?: string;

	status?: boolean;

	date_of_birth?: Date;

	customer_type?: CustomerTypeEnum;

	seller_id: number;
}

export class CreateCustomerPayload extends CustomerPayloadDto {
	shipping_info: CustomerAddress[];
}

export class UpdateCustomerPayload extends CustomerPayloadDto {
	new_shipping_info: CustomerAddress[];

	updated_shipping_info: CustomerAddress[];

	removed_shipping_info: number[];
}
