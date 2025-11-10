import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

import { AuthService } from 'src/auth/auth.service';
import { DefaultReturnType } from '../types/return.type';
import { isError } from '../utils/error.util';

/**
 * @summary WebSocket service
 * @description Service for handling WebSocket connections
 * @functions
 * - handleInit
 * - handleConnection
 * - handleDisconnect
 * - getClient
 * - sendDataToClient
 *
 * @private
 * - getUserIdFromSocket
 */
@Injectable()
export class WebSocketService {
	// socketId -> userId
	private readonly connectedClients: Map<string, string> = new Map();
	// userId -> socket
	private readonly clientsByUserId: Map<string, Socket> = new Map();

	constructor(private readonly authService: AuthService) {}

	/**
	 * Handle WebSocket initialization
	 */
	handleInit(): void {}

	/**
	 * Handle WebSocket connection
	 */
	async handleConnection(socket: Socket): Promise<DefaultReturnType<true>> {
		const idFromToken = await this.getUserIdFromSocket(socket);
		if (isError(idFromToken)) {
			return {
				...idFromToken,
				trace: [...idFromToken.trace, 'WebSocketService - handleConnection - this.getUserIdFromSocket'],
			};
		}

		const socketId = socket.id;
		this.connectedClients.set(socketId, idFromToken);
		this.clientsByUserId.set(idFromToken, socket);

		return true;
	}

	/**
	 * Handle WebSocket disconnection
	 */
	async handleDisconnect(socket: Socket): Promise<DefaultReturnType<true>> {
		const userId = this.connectedClients.get(socket.id);
		if (!userId) return true;

		this.connectedClients.delete(socket.id);
		this.clientsByUserId.delete(userId || '');

		return true;
	}

	/**
	 * Get a client
	 */
	getClient(props: { userId?: string; socketId?: string }): DefaultReturnType<{ userId: string; socket: Socket }> {
		const { userId, socketId } = props;

		if (!userId && !socketId) {
			return {
				userMessage: 'Client not found!',
				error: 'No userId or socketId provided!',
				errorType: 'BadRequestException',
				errorData: { props },
				trace: ['WebSocketService - getClient - if (!userId && !socketId)'],
			};
		}

		if (userId) {
			const socket = this.clientsByUserId.get(userId);
			if (!socket) {
				return {
					userMessage: 'Client not found!',
					error: 'No socket found for the provided userId!',
					errorType: 'NotFoundException',
					errorData: { userId },
					trace: ['WebSocketService - getClient - this.clientsByUserId.get'],
				};
			}

			return { userId, socket };
		} else if (socketId) {
			const userIdFromSocket = this.connectedClients.get(socketId);
			if (!userIdFromSocket) {
				return {
					userMessage: 'Client not found!',
					error: 'No userId found for the provided socketId!',
					errorType: 'NotFoundException',
					errorData: { socketId },
					trace: ['WebSocketService - getClient - this.connectedClients.get'],
				};
			}

			const socket = this.clientsByUserId.get(userIdFromSocket);
			if (!socket) {
				return {
					userMessage: 'Client not found!',
					error: 'No socket found for the provided userId from socketId!',
					errorType: 'NotFoundException',
					errorData: { userId: userIdFromSocket, socketId },
					trace: ['WebSocketService - getClient - this.clientsByUserId.get'],
				};
			}

			return { userId: userIdFromSocket, socket };
		}

		return {
			userMessage: 'Client not found!',
			error: 'No userId or socketId provided!',
			errorType: 'BadRequestException',
			errorData: { props },
			trace: ['WebSocketService - getClient - if (!userId && !socketId)'],
		};
	}

	/**
	 * Send data to a client
	 */
	sendDataToClient(props: {
		userId: string;
		socketId?: undefined;
		event: string;
		data: { status: 'success' | 'failed'; content: any };
	}): DefaultReturnType<true>;
	sendDataToClient(props: {
		userId?: undefined;
		socketId: string;
		event: string;
		data: { status: 'success' | 'failed'; content: any };
	}): DefaultReturnType<true>;
	sendDataToClient(props: {
		userId?: string;
		socketId?: string;
		event: string;
		data: { status: 'success' | 'failed'; content: any };
	}): DefaultReturnType<boolean> {
		const { userId, socketId, event, data } = props;

		if (!userId && !socketId) {
			return false;
			// return {
			// 	userMessage: 'Client not found!',
			// 	error: 'No userId or socketId provided!',
			// 	errorType: 'BadRequestException',
			// 	errorData: { props },
			// 	trace: ['WebSocketService - sendDataToClient - if (!userId && !socketId)'],
			// };
		}

		if (userId) {
			const socket = this.clientsByUserId.get(userId);
			if (!socket) {
				return false;
				// return {
				// 	userMessage: 'Client not found!',
				// 	error: 'No socket found for the provided userId!',
				// 	errorType: 'NotFoundException',
				// 	errorData: { userId },
				// 	trace: ['WebSocketService - sendDataToClient - this.clientsByUserId.get'],
				// };
			}

			socket.emit(event, data);
			return true;
		} else if (socketId) {
			const userIdFromSocket = this.connectedClients.get(socketId);
			if (!userIdFromSocket) {
				return false;
				// return {
				// 	userMessage: 'Client not found!',
				// 	error: 'No userId found for the provided socketId!',
				// 	errorType: 'NotFoundException',
				// 	errorData: { socketId },
				// 	trace: ['WebSocketService - sendDataToClient - this.connectedClients.get'],
				// };
			}

			const socket = this.clientsByUserId.get(userIdFromSocket);
			if (!socket) {
				return false;
				// return {
				// 	userMessage: 'Client not found!',
				// 	error: 'No socket found for the provided userId from socketId!',
				// 	errorType: 'NotFoundException',
				// 	errorData: { userId: userIdFromSocket, socketId },
				// 	trace: ['WebSocketService - sendDataToClient - this.clientsByUserId.get'],
				// };
			}

			socket.emit(event, data);
		}

		return true;
	}

	/**
	 * Get user id from socket
	 */
	private async getUserIdFromSocket(socket: Socket): Promise<DefaultReturnType<string>> {
		const parsedCookies = cookie.parse(socket.handshake.headers.cookie || '');
		const refreshToken = parsedCookies['refreshToken'] || '';

		const dataFromToken = await this.authService.verifyUserRefreshToken(refreshToken);
		if (isError(dataFromToken)) {
			return {
				...dataFromToken,
				trace: [
					...dataFromToken.trace,
					'WebSocketService - getUserIdFromSocket - this.authService.verifyToken',
				],
			};
		}

		return dataFromToken.id;
	}
}
