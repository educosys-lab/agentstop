import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { openAiExecute } from './execute';
import { OpenAiConfigType, OpenAiDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const openAiTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<OpenAiDataType, OpenAiConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await openAiExecute({ format, data, config });
};
