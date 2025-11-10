import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { LinkedInPostConfigType, LinkedInPostDataType } from './validate';
import { linkedInPostExecute } from './execute';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const linkedInPostTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<LinkedInPostDataType, LinkedInPostConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await linkedInPostExecute({ format, data, config });
};
