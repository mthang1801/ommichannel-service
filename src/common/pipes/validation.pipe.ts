import { ArgumentMetadata, PipeTransform, HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export class ValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}

		const object = plainToInstance(metatype, value);

		const errors = await validate(object);

		if (errors.length) {
			throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST);
		}

		return value;
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
