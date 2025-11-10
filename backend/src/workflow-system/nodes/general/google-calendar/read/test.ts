import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { googleCalendarReadExecute } from './execute';
import { GoogleCalendarReadConfigType, GoogleCalendarReadDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';

export const googleCalendarReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarReadDataType, GoogleCalendarReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleCalendarReadExecute({ format, data, config });
};
