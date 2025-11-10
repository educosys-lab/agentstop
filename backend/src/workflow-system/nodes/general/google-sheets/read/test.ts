import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { googleSheetsReadExecute } from './execute';
import { GoogleSheetsReadDataType, GoogleSheetsReadConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const googleSheetsReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleSheetsReadDataType, GoogleSheetsReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleSheetsReadExecute({ format, data, config });
};
