import { Controller, Post, Body } from '@nestjs/common';

import { setNgrokUrl } from './ngrok-url.store';

@Controller('ngrok')
export class NgrokController {
	@Post('update-url')
	updateNgrokUrl(@Body() body: { url: string }) {
		setNgrokUrl(body.url);
		return { success: true, ngrokUrl: body.url };
	}
}
