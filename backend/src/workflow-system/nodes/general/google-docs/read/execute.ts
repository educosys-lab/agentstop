import { google } from 'googleapis';

import { GoogleDocsReadConfigType, GoogleDocsReadDataType, googleDocsReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleDocsReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsReadDataType, GoogleDocsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleDocsReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleDocsReadExecute - googleDocsReadValidate'],
			};
		}

		const { access_token, file_id } = validate.config;

		let authClient: any = undefined;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });
		authClient = oauth2Client;

		const response = await google.docs({ version: 'v1', auth: authClient }).documents.get({ documentId: file_id });

		const content =
			response.data.body?.content
				?.map((c) => c.paragraph?.elements?.map((e) => e.textRun?.content).join('') || '')
				.join('\n')
				.trim() || 'No content available';

		return { status: 'success', format: 'string', content: { defaultData: content } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleDocsReadExecute - catch'],
		};
	}
};
