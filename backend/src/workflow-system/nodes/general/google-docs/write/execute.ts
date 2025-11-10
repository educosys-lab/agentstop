import { google } from 'googleapis';
import { docs_v1 } from '@googleapis/docs';

import { GoogleDocsWriteConfigType, GoogleDocsWriteDataType, googleDocsWriteValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleDocsWriteExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsWriteDataType, GoogleDocsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleDocsWriteValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleDocsWriteExecute - googleDocsWriteValidate'],
			};
		}

		const { access_token, file_id } = validate.config;
		const { defaultData } = validate.data;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const docs = google.docs({ version: 'v1', auth: oauth2Client });

		let documentError = '';
		const document = await docs.documents.get({ documentId: file_id }).catch((error) => {
			documentError = returnErrorString(error);
		});

		if (!document || typeof (document as any).data === 'string')
			return {
				userMessage: 'Document not found or invalid document ID!',
				error: 'Document not found or invalid document ID!',
				errorType: 'InternalServerErrorException',
				errorData: { documentError },
				trace: ['googleDocsWriteExecute - document'],
			};

		const endIndex =
			(document as any).data.body?.content?.reduce((maxIndex, element) => {
				if (element.endIndex) return Math.max(maxIndex, element.endIndex - 1);
				return maxIndex;
			}, 1) || 1;

		let messageContent = defaultData;

		if (typeof defaultData === 'object' && defaultData !== null && 'data' in defaultData) {
			messageContent = defaultData.data;
		}

		const formattedDefaultData =
			typeof messageContent === 'string'
				? formatLLMResponseToText(messageContent)
				: JSON.stringify(messageContent);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'googleDocsWriteExecute - formattedDefaultData'],
			};
		}

		const textToInsert = formattedDefaultData
			? formattedDefaultData.endsWith('\n')
				? formattedDefaultData
				: `${formattedDefaultData}\n`
			: '\n';

		const requests: docs_v1.Schema$Request[] = [
			{ insertText: { location: { index: endIndex }, text: textToInsert } },
		];

		await docs.documents.batchUpdate({ documentId: file_id, requestBody: { requests } }).catch((error) => {
			return {
				status: 'failed',
				format: 'text',
				content: `error - document - googleDocsWriteExecute - Error appending text to document: ${error}`,
			};
		});

		const googleDocsLink = `https://docs.google.com/document/d/${file_id}`;

		return { status: 'success', format: 'string', content: { defaultData: googleDocsLink } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleDocsWriteExecute - catch'],
		};
	}
};
