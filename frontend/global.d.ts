export {};

declare global {
	interface Window {
		google: typeof google;
		gapi: any;
	}

	namespace google {
		namespace accounts {
			namespace oauth2 {
				interface TokenClientConfig {
					client_id: string;
					scope: string;
					callback: (response: TokenResponse) => void;
				}

				interface TokenResponse {
					access_token: string;
					expires_in: number;
					prompt: string;
					token_type: string;
					error?: string;
				}

				interface TokenClient {
					requestAccessToken: (options?: { prompt?: string }) => void;
					callback: (response: TokenResponse) => void;
				}

				function initTokenClient(config: TokenClientConfig): TokenClient;
			}
		}
	}
}
