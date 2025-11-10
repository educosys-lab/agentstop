from typing import Literal

ErrorType = Literal[
    'BadRequestException',
    'ConflictException',
    'ForbiddenException',
    'InternalServerErrorException',
    'NotAcceptableException',
    'NotFoundException',
    'UnauthorizedException',
]
