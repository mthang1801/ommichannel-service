import { IApiMenu, IFlatMenu } from 'src/interfaces/funct.interface';
import { Funct } from 'src/models/funct.model';

export class GetFunctResponse {
	data: Funct[];
	features: string[];
	actions?: string[];
	flatMenu?: IFlatMenu[];
	apiMenu?: IApiMenu[];
}
