import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PathUrlObjectTypeEnum } from 'src/common/constants/enum';

export class PathUrls {
	@IsNotEmpty()
	@IsString()
	path_url: string;

	@IsOptional()
	@IsNumber()
	index = 0;

	@IsOptional()
	@IsNumber()
	offset_width: number;

	@IsOptional()
	@IsNumber()
	offset_height: number;
}

export class CreatePathUrlDto {
	@IsNotEmpty()
	object_id: any;

	@IsNotEmpty()
	@IsEnum(PathUrlObjectTypeEnum)
	object_type: PathUrlObjectTypeEnum;

	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => PathUrls)
	path_urls: PathUrls[];
}
