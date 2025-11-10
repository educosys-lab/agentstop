import axios from 'axios';

import { RagIngestionConfigType, RagIngestionDataType, ragIngestionValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const ragIngestionExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<RagIngestionDataType, RagIngestionConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await ragIngestionValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'ragIngestionExecute - ragIngestionValidate'],
			};
		}

		const { sourceType, text, url, sourceName } = validate.config;
		// const { defaultData } = validate.data;

		// const formattedDefaultData = typeof defaultData === 'string' ? defaultData : JSON.stringify(defaultData);

		const response = await axios.post(`${process.env.PYTHON_BACKEND_URL}/rag/ingest`, {
			source_type: sourceType,
			data: url || text,
			source_name: sourceName,
		});

		return { status: 'success', format: 'string', content: { defaultData: response.data.message } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['ragIngestionExecute - catch'],
		};
	}
};
