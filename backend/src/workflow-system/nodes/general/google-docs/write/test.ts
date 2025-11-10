import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { googleDocsWriteExecute } from './execute';
import { GoogleDocsWriteConfigType, GoogleDocsWriteDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const googleDocsWriteTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleDocsWriteDataType, GoogleDocsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleDocsWriteExecute({ format, data, config });
};
