import { ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from 'src/models/category.model';

export class GetCategoriesListResponseDto extends Category {
	@ApiPropertyOptional({
		type: 'array',
		example: [
			{
				id: 20000002,
				parent_id: 20000001,
				category_name: 'Macbook',
				status: 1,
				url: 'macbook',
				description: 'Danh mục laptop',
				level: 1,
				id_path: '20000001/20000002',
				index: 0,
				category_image: null,
				redirect_url: '',
				redirect_type: 300,
				children: [
					{
						id: 20000005,
						parent_id: 20000002,
						category_name: 'Macbook pro',
						status: 1,
						url: 'macbook-pro',
						description: 'Danh mục laptop',
						level: 2,
						id_path: '20000001/20000002/20000005',
						index: 0,
						category_image: null,
						redirect_url: '',
						redirect_type: 300
					}
				]
			}
		]
	})
	children: Category[];
}
