import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { slackSendExecute } from './execute';
import { SlackSendConfigType, SlackSendDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const slackSendTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackSendDataType, SlackSendConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await slackSendExecute({ format, data, config });
};
