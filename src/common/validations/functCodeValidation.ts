import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class FunctCodeValidate implements ValidatorConstraintInterface {
	validate(functCode: string, args: ValidationArguments) {
		return functCode.indexOf('___') === -1;
	}
	defaultMessage(validationArguments?: ValidationArguments): string {
		return `Funct Code không hợp lệ`;
	}
}
