// Simple singleton to hold the ngrok URL in memory

let ngrokUrl = '';

export function setNgrokUrl(url: string) {
	ngrokUrl = url;
}

export function getNgrokUrl(): string {
	return ngrokUrl;
}
