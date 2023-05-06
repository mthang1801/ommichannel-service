import { VERSION_NEUTRAL } from '@nestjs/common';
import { Controller, Get, Version } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	HttpHealthIndicator,
	SequelizeHealthIndicator
} from '@nestjs/terminus';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { appConfig } from 'src/configs/configs';

@Controller('health')
@ApiTags('Health')
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly http: HttpHealthIndicator,
		private readonly sequelizeDb: SequelizeHealthIndicator,
		private readonly disk: DiskHealthIndicator
	) {}

	@Get()
	@Version(VERSION_NEUTRAL)
	@SkipAuth()
	@HealthCheck()
	check() {
		return this.health.check([
			() => this.http.pingCheck('nestjs-docs', `${appConfig.healthCheckAPIDomain}/api/v1/docs`)
		]);
	}
}
