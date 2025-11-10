import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { googleCalendarWriteExecute } from './execute';
import { GoogleCalendarWriteDataType, GoogleCalendarWriteConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const googleCalendarWriteTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarWriteDataType, GoogleCalendarWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await googleCalendarWriteExecute({ format, data, config });
};
