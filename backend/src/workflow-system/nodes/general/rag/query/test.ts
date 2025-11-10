import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { ragQueryExecute } from './execute';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { RagQueryDataType, RagQueryConfigType } from './validate';

export const ragQueryTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<RagQueryDataType, RagQueryConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>> => {
	return await ragQueryExecute({ format, data, config });
};
