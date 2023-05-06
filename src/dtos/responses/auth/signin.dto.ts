import { ApiProperty } from '@nestjs/swagger';
import { IFlatMenu } from 'src/interfaces/funct.interface';
import { Funct } from 'src/models/funct.model';
import { SellerGeneralSetting } from 'src/models/sellerGeneralSetting.model';
import { Catalog } from '../../../models/catalog.model';
export class SigninResponseDto {
	@ApiProperty()
	token: string;

	@ApiProperty()
	fullName: string;

	@ApiProperty()
	avatar: string;

	@ApiProperty()
	phone: string;

	@ApiProperty()
	user_type: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	uuid: string;

	@ApiProperty()
	menu: Funct[];

	@ApiProperty()
	flatMenu: IFlatMenu[];

	@ApiProperty()
	features: string[];

	@ApiProperty()
	actions: string[];

	@ApiProperty()
	warehouseIdsList: number[];

	@ApiProperty()
	generalSettings: SellerGeneralSetting[];

	@ApiProperty()
	catalogs: Catalog[];
}
