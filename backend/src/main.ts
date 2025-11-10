import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { SocketIoAdapter } from './shared/websocket/socket-io.adapter';

import { AppModule } from './app.module';
import { corsMiddleware } from './shared/middlewares/cors.middleware';
import { swaggerMiddleware } from './shared/middlewares/swagger.middleware';
import { AuthGuard } from './auth/auth.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = app.get(ConfigService);

	// CORS
	app.use(corsMiddleware);
	// Auth
	app.use(cookieParser());
	// Guard
	app.useGlobalGuards(app.get(AuthGuard));
	// WebSocket
	app.useWebSocketAdapter(new SocketIoAdapter(app, config));
	// Swagger
	swaggerMiddleware(app);

	await app.listen(process.env.BACKEND_PORT || '');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
