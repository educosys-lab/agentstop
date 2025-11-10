import { v4 as uuid } from 'uuid';

import { InteractResponderConfigType, InteractResponderDataType, interactResponderValidate } from './validate';
import { ResponderNodePropsType, ResponderNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import { isObject } from 'src/shared/utils/object.util';

export const interactResponderExecute = async ({
	format,
	data,
	config,
}: ResponderNodePropsType<InteractResponderDataType, InteractResponderConfigType>): Promise<
	DefaultReturnType<ResponderNodeReturnType>
> => {
	try {
		const validate = await interactResponderValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'interactResponderExecute - interactResponderValidate'],
			};
		}

		const { defaultData, addMessage } = validate.data;
		const { userId, workflowId } = validate.config;

		const formattedDefaultData = typeof defaultData === 'string' ? defaultData : JSON.stringify(defaultData);

		const response = await addMessage({
			id: uuid(),
			workflowId,
			format,
			content: formattedDefaultData,

			userId,
			isInternal: true,
			showTempData: isObject(defaultData) && defaultData.flagResponse === '',
		});
		if (isError(response)) {
			return {
				...response,
				trace: [...response.trace, 'interactResponderExecute - addMessage'],
			};
		}

		return {
			status: 'success',
			format: 'string',
			content: { defaultData: 'Message sent successfully' },
		};
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				format,
				data,
				config,
				error: returnErrorString(error),
			},
			trace: ['interactResponderExecute - catch'],
		};
	}
};
