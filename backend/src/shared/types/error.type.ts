export const ERROR_TYPES = [
	'BadRequestException',
	'ConflictException',
	'ForbiddenException',
	'InternalServerErrorException',
	'NotAcceptableException',
	'NotFoundException',
	'UnauthorizedException',
] as const;
export type ErrorType = (typeof ERROR_TYPES)[number];
