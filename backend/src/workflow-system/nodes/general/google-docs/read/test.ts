import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { googleDocsReadExecute } from './execute';
import { GoogleDocsReadDataType, GoogleDocsReadConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const googleDocsReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsReadDataType, GoogleDocsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleDocsReadExecute({ format, data, config });
};
