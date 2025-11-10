import axios from 'axios';

import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { LinkedInPostConfigType, LinkedInPostDataType, linkedInPostValidate } from './validate';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const linkedInPostExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<LinkedInPostDataType, LinkedInPostConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await linkedInPostValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'linkedInPostExecute - linkedInPostValidate'],
			};
		}

		const { defaultData } = validate.data;
		const { access_token } = validate.config;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'linkedInPostExecute - formatLLMResponseToText'],
			};
		}

		const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
			headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
		});

		if (!userResponse.data || !userResponse.data.sub) {
			return {
				userMessage: 'Invalid or missing user information!',
				error: 'Invalid or missing user information!',
				errorType: 'InternalServerErrorException',
				errorData: { error: 'Invalid or missing user information' },
				trace: ['linkedInPostExecute - catch'],
			};
		}

		const sub = userResponse.data.sub;
		const userId = sub.split(':').pop();
		const memberUrn = `urn:li:person:${userId}`;

		const postData = {
			author: memberUrn,
			lifecycleState: 'PUBLISHED',
			specificContent: {
				'com.linkedin.ugc.ShareContent': {
					shareCommentary: { text: formattedDefaultData },
					shareMediaCategory: 'NONE',
				},
			},
			visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
		};

		await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
			headers: {
				Authorization: `Bearer ${access_token}`,
				'Content-Type': 'application/json',
				'X-Restli-Protocol-Version': '2.0.0',
			},
		});

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Successfully posted to LinkedIn' },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['linkedInPostExecute - catch'],
		};
	}
};
