import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class UpdatedProductCategory {
	@ApiPropertyOptional({ example: 1 })
	@IsNotEmpty()
	product_id: number;

	@ApiPropertyOptional({ example: 1 })
	@IsNotEmpty()
	index: number;
}

export class UpdateProductInCategoryDto {
	@ApiPropertyOptional({
		example: [1, 2, 3, 4],
		description: 'tạo sản phẩm trong danh mục'
	})
	@IsOptional()
	@IsArray()
	new_products: number[] = [];

	@ApiPropertyOptional({
		example: [
			{ product_id: 1, index: 0 },
			{ product_id: 2, index: 1 }
		],
		description: 'Cập nhật/ tạo sản phẩm'
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => UpdatedProductCategory)
	@IsArray()
	updated_products: UpdatedProductCategory[] = [];

	@ApiPropertyOptional({ example: [1, 2, 3] })
	@IsOptional()
	@IsArray()
	removed_products: number[] = [];

	@ApiPropertyOptional({ description: 'Xoá theo thứ bậc' })
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	removed_cascade = false;
}
