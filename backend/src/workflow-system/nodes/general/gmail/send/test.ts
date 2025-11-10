import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { gmailSendExecute } from './execute';
import { GmailSendConfigType, GmailSendDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const gmailSendTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailSendDataType, GmailSendConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await gmailSendExecute({ format, data, config });
};
