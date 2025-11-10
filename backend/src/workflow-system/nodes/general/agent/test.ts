import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { agentExecute } from './execute';
import { AgentDataType, AgentConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const agentTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<AgentDataType, AgentConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await agentExecute({ format, data, config });
};
