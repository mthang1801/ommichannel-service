import { forwardRef, Module } from '@nestjs/common';
import { TransportOverviewController } from 'src/controllers/api/transportOverview.controller';
import { TransportOverviewService } from 'src/services/transportOverview.service';
import { OrderModule } from './order.module';

@Module({
	imports: [forwardRef(() => OrderModule)],
	controllers: [TransportOverviewController],
	providers: [TransportOverviewService],
	exports: [TransportOverviewService]
})
export class TransportOverviewModule {}
