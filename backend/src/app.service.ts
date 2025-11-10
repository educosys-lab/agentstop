import { Injectable } from '@nestjs/common';

import { getNgrokUrl } from './shared/ngrok/ngrok-url.store';

@Injectable()
export class AppService {
	constructor() {}

	welcome(): string {
		const ngrokUrl = getNgrokUrl();

		return `Welcome to Agentstop AI!\nWebhook URL: ${ngrokUrl || 'Not available yet!'}`;
	}

	undefinedRoute(): string {
		return `Stop exploring unnecessarily my friend, trust me you wouldn't want to upset Keerti!`;
	}
}
