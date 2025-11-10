import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';

export function swaggerMiddleware(app: INestApplication<any>) {
	const config = new DocumentBuilder()
		.setTitle('Agentstop Backend')
		.setDescription('Agentstop Backend API Documentation')
		.setVersion('1.0')
		.addTag('Agentstop')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	return (req: Request, res: Response, next: NextFunction) => next();
}
