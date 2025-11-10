import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { slackReadExecute } from './execute';
import { SlackReadConfigType, SlackReadDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const slackReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<SlackReadDataType, SlackReadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await slackReadExecute({ format, data, config });
};
