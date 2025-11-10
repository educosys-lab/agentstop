import { google } from 'googleapis';

import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { GmailSendConfigType, GmailSendDataType, gmailSendValidate } from './validate';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const gmailSendExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailSendDataType, GmailSendConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	try {
		const validate = await gmailSendValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'gmailSendExecute - gmailSendValidate'],
			};
		}

		const {
			to_email_addresses,
			cc_email_addresses_ifAny,
			bcc_email_addresses_ifAny,
			subject_of_email,
			body_of_email,
		} = validate.data;
		const { access_token, to_from_config, cc_from_config, bcc_from_config, subject_from_config, body_from_config } =
			validate.config;

		const to = to_from_config || to_email_addresses;
		const cc = cc_from_config || cc_email_addresses_ifAny;
		const bcc = bcc_from_config || bcc_email_addresses_ifAny;
		const subject = subject_from_config || subject_of_email;
		const body = body_from_config || body_of_email;

		const formattedBody = typeof body === 'string' ? formatLLMResponseToText(body) : JSON.stringify(body);
		if (isError(formattedBody)) {
			return {
				...formattedBody,
				trace: [...formattedBody.trace, 'gmailSendExecute - formatLLMResponseToText'],
			};
		}

		const headers = [
			`To: ${to}`,
			cc ? `Cc: ${cc}` : '',
			bcc ? `Bcc: ${bcc}` : '',
			`Subject: ${subject}`,
			'Content-Type: text/plain; charset="UTF-8"',
			'Content-Transfer-Encoding: 7bit',
		]
			.filter(Boolean)
			.join('\r\n');

		const email = `${headers}\r\n\r\n${formattedBody}`;

		const encodedEmail = Buffer.from(email)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token: access_token });

		const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

		await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedEmail } });

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Email sent successfully' },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['gmailSendExecute - catch'],
		};
	}
};
