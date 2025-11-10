import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { webScraperExecute } from './execute';
import { WebScraperDataType, WebScraperConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const webScraperTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<WebScraperDataType, WebScraperConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await webScraperExecute({ format, data, config });
};
