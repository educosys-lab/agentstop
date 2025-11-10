import { ReactNode, Suspense } from 'react';
import Script from 'next/script';
import { ReactFlowProvider } from '@xyflow/react';

import './globals.css';

import { poppins } from './fonts';
import { DEFAULT_METADATA } from './seo';

import { ThemeProvider } from '@/providers/Theme.provider';
import { ModalProvider } from '@/providers/Modal.provider';
import { StoreProvider } from '@/providers/Store.provider';
import { WebSocketProvider } from '@/providers/WebSocket.provider';

import ToasterElement from '@/components/elements/ToasterElement';
import { GlobalProvider } from '@/providers/Global.provider';
// import { SseProvider } from '@/providers/Sse.provider';

export const metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<StoreProvider>
			{/* <SseProvider> */}
			<WebSocketProvider>
				<html lang="en">
					<body className={poppins.variable}>
						<main className="flex min-h-dvh flex-col">
							<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
								<Script src="https://checkout.razorpay.com/v1/checkout.js" />

								<ModalProvider>
									<ReactFlowProvider>
										<Suspense fallback={null}>
											<GlobalProvider>{children}</GlobalProvider>
										</Suspense>
									</ReactFlowProvider>
									<ToasterElement />
								</ModalProvider>
							</ThemeProvider>
						</main>
					</body>
				</html>
			</WebSocketProvider>
			{/* </SseProvider> */}
		</StoreProvider>
	);
}
