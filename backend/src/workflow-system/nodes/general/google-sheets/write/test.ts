import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { googleSheetsWriteExecute } from './execute';
import { GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsWriteTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsWriteDataType, GoogleSheetsWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleSheetsWriteExecute({ format, data, config });
};
