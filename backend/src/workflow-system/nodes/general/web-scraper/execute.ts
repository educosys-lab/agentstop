import axios from 'axios';
import * as cheerio from 'cheerio';

import { WebScraperConfigType, WebScraperDataType, webScraperValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const webScraperExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<WebScraperDataType, WebScraperConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await webScraperValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'webScraperExecute - webScraperValidate'],
			};
		}

		const { url } = validate.config;

		const response = await axios.get(url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebScraperBot/1.0)' },
		});

		const value = cheerio.load(response.data);

		value('script, style').remove();
		const content = value('body').text().replace(/\s+/g, ' ').trim();

		if (!content) return { status: 'success', format: 'string', content: { defaultData: 'No content found' } };

		return { status: 'success', format: 'string', content: { defaultData: content } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['webScraperExecute - catch'],
		};
	}
};
