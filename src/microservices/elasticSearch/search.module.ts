import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { elsConfig } from 'src/configs/configs';
import { SearchService } from 'src/microservices/elasticSearch/search.service';

@Global()
@Module({
	imports: [
		ConfigModule,
		ElasticsearchModule.register({
			node: elsConfig.searchNode,
			auth: {
				username: elsConfig.searchUser,
				password: elsConfig.searchPass
			}
		})
	],
	providers: [SearchService],
	exports: [SearchService]
})
export class ElasticSearchModule {}
