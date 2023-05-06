import { PaginatedDto } from 'src/dtos/page.dto';
import { ApiCreatedResponseExtra } from './apiCreatedResponse.dto';
import { ApiOkResponseExtra } from './apiOkResponse.dto';
import { ApiUpdateResponseExtra } from './apiUpdateResponse.dto';

export const extraModels = [PaginatedDto, ApiCreatedResponseExtra, ApiUpdateResponseExtra, ApiOkResponseExtra];
