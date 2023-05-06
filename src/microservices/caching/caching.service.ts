import { HttpException, Injectable } from '@nestjs/common';
import { ValueType } from 'ioredis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CachingService {
	constructor(private readonly redisService: RedisService) {}

	getClient(name: string = null) {
		return this.redisService.getClient(name);
	}

	async getAllKeys(partern: string): Promise<string[]> {
		try {
			return this.getClient().keys(partern);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async selectIndex(index: number) {
		await this.getClient().select(index);
	}

	async append(key: string, val: string): Promise<void> {
		try {
			await this.getClient().append(key, val);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async exist(key: string): Promise<boolean> {
		try {
			return (await this.getClient().exists(key)) === 1 ? true : false;
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async hashSet(key: string, field: string, value: string): Promise<void> {
		try {
			await this.getClient().hset(key, field, value);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async hashGet(key: string, field: string): Promise<string> {
		try {
			return await this.getClient().hget(key, field);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async hashGetAll(key: string): Promise<any> {
		try {
			return await this.getClient().hgetall(key);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	enQueue(key: string, value: string) {
		const client = this.getClient();

		return new Promise((resolve, reject) => {
			client.rpush(key, value, (err, res) => (err ? reject(err) : resolve(res || null)));
		});
	}

	async get(key: string): Promise<any> {
		try {
			return await this.getClient().get(key);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async set(key: string, value: string, ttl = -1): Promise<void> {
		try {
			await this.getClient().set(key, value, 'EX', ttl);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async del(keys: string): Promise<any> {
		try {
			return await this.getClient().del(keys);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async ttl(key: string): Promise<number> {
		try {
			return await this.getClient().ttl(key);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async command(command: string, ...args: ValueType[]): Promise<any> {
		try {			
			return await this.getClient().send_command(command, ...args);
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}
}
