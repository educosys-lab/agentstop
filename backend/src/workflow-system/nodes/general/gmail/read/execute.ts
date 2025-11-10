import { google } from 'googleapis';

import { GmailReadConfigType, GmailReadDataType, gmailReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const gmailReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailReadDataType, GmailReadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await gmailReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'gmailReadExecute - gmailReadValidate'],
			};
		}

		const { access_token, criteria, keyword, mark_as_read, max_results = '1' } = validate.config;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

		const criteriaQuery = criteria === 'read' ? '-in:unread' : criteria === 'unread' ? 'in:unread' : '';
		const keywordQuery = keyword ? keyword.trim() : '';
		const query = [criteriaQuery, keywordQuery].filter(Boolean).join(' ').trim();

		const emailResponse = await gmail.users.messages.list({
			userId: 'me',
			q: query || undefined,
			maxResults: parseInt(max_results),
		});

		const messages = emailResponse.data.messages;

		if (!messages || messages.length < 1) {
			return { status: 'success', format: 'string', content: { defaultData: 'No emails found' } };
		}

		const results: { from: string; subject: string; date: string; body: string }[] = [];

		for (const message of messages) {
			const value = await gmail.users.messages.get({ userId: 'me', id: message.id! });

			const headers = value.data.payload?.headers || [];
			const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
			const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
			const date = headers.find((h) => h.name === 'Date')?.value || 'Unknown Date';
			const body = extractEmailBody(value.data.payload);

			results.push({ from, subject, date, body });

			if (mark_as_read === 'yes') {
				await gmail.users.messages.modify({
					userId: 'me',
					id: message.id!,
					requestBody: { removeLabelIds: ['UNREAD'] },
				});
			}
		}

		return { status: 'success', format: 'array', content: { defaultData: results } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['gmailReadExecute - catch'],
		};
	}
};

function decodeBase64(data: string): string {
	try {
		const base64String = data.replace(/-/g, '+').replace(/_/g, '/');
		return Buffer.from(base64String, 'base64').toString('utf-8');
	} catch {
		return '';
	}
}

function extractEmailBody(payload: any): string {
	let body = '';

	if (payload.parts) {
		const plainTextPart = payload.parts.find((part: any) => part.mimeType === 'text/plain');
		if (plainTextPart && plainTextPart.body && plainTextPart.body.data) {
			body = decodeBase64(plainTextPart.body.data);
		} else {
			const htmlPart = payload.parts.find((part: any) => part.mimeType === 'text/html');
			if (htmlPart && htmlPart.body && htmlPart.body.data) {
				body = decodeBase64(htmlPart.body.data);
				body = body
					.replace(/<[^>]+>/g, ' ')
					.replace(/\s+/g, ' ')
					.trim();
			}
		}
	} else if (payload.body && payload.body.data) {
		body = decodeBase64(payload.body.data);
		if (payload.mimeType === 'text/html') {
			body = body
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
		}
	}

	return body || 'No content';
}
