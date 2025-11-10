import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { gmailReadExecute } from './execute';
import { GmailReadDataType, GmailReadConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const gmailReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GmailReadDataType, GmailReadConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await gmailReadExecute({ format, data, config });
};
