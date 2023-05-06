import { AttributeFilterTypeEnum, AttributePurposeEnum, AttributeTypeEnum } from 'src/common/constants/enum';
import { AttributeValuesDto } from './requests/attributes/attributeValue.dto';
import { AttributeValueRequest } from './requests/attributes/updateAttribute.dto';

export class AttributePayload {
	attribute_code?: string;

	attribute_name?: string;

	seller_id?: number;

	purposes?: AttributePurposeEnum;

	status?: boolean;

	attribute_type?: AttributeTypeEnum;

	filter_type?: AttributeFilterTypeEnum;
}

export class CreateAttributePayload extends AttributePayload {
	values: AttributeValuesDto[];
}

export class UpdateAttributePayload extends AttributePayload {
	updated_values?: AttributeValueRequest[];

	removed_values?: number[];
}
