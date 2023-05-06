import { SetMetadata } from '@nestjs/common';

export enum Metadata {
	'SKIP_AUTH' = 'SKIP_AUTH'
}

export const SkipAuth = () => SetMetadata(Metadata.SKIP_AUTH, true);
