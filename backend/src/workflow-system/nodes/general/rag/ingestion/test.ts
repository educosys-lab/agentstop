import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { ragIngestionExecute } from './execute';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { RagIngestionDataType, RagIngestionConfigType } from './validate';

export const ragIngestionTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<RagIngestionDataType, RagIngestionConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await ragIngestionExecute({ format, data, config });
};
