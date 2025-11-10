import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { httpExecute } from './execute';
import { HttpDataType, HttpConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const httpTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<HttpDataType, HttpConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await httpExecute({ format, data, config });
};
