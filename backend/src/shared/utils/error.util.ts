import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	InternalServerErrorException,
	NotAcceptableException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';

import { ErrorType } from '../types/error.type';
import { ErrorResponseType } from '../types/return.type';
import { isObject } from './object.util';

export function throwError(props: { error: string; errorType: ErrorType }): never {
	const { error, errorType } = props;

	const errorObject: { [key in ErrorType]: any } = {
		BadRequestException: new BadRequestException(error),
		ConflictException: new ConflictException(error),
		ForbiddenException: new ForbiddenException(error),
		InternalServerErrorException: new InternalServerErrorException(error),
		NotAcceptableException: new NotAcceptableException(error),
		NotFoundException: new NotFoundException(error),
		UnauthorizedException: new UnauthorizedException(error),
	};

	throw errorObject[errorType] || new InternalServerErrorException('An unexpected error occurred');
}

export const isError = (response: unknown): response is ErrorResponseType => {
	return isObject(response) && 'error' in response;
};
