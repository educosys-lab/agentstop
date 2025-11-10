'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePathname } from 'next/navigation';

import { useAppSelector } from '@/store/hook/redux.hook';

type WebSocketContextType = { socket: Socket | null };

const WebSocketContext = createContext<WebSocketContextType>({ socket: null });

export function WebSocketProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const user = useAppSelector((state) => state.userState.user);

	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (!user || (!pathname.startsWith('/chat') && !pathname?.startsWith('/whatsapp-campaign'))) {
			return;
		}

		const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
			withCredentials: true,
		});

		const handleConnect = () => setSocket(newSocket);

		const handleDisconnect = () => {};

		newSocket.once('connect', handleConnect);
		newSocket.on('disconnect', handleDisconnect);
		// newSocket.on('invalid_token', handleInvalidToken);

		return () => {
			newSocket.off('connect', handleConnect);
			newSocket.off('disconnect', handleDisconnect);
			// newSocket.off('invalid_token', handleInvalidToken);
			newSocket.off('connect_error');
			newSocket.disconnect();
		};
	}, [user]);

	return <WebSocketContext.Provider value={{ socket }}>{children}</WebSocketContext.Provider>;
}

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) throw new Error('No web socket context found!');
	return context;
};
