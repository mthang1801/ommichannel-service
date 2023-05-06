import { Global, Module } from '@nestjs/common';
import { UploadController } from 'src/controllers/common/upload.controller';
import { UploadService } from 'src/services/upload.services';

@Global()
@Module({
	providers: [UploadService],
	exports: [UploadService],
	controllers: [UploadController]
})
export class UploadModule {}
