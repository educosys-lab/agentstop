import { GeneralNodePropsType } from 'src/workflow-system/workflow-system.type';
import { resumePdfGeneratorExecute } from './execute';
import { ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType } from './validate';

export const resumePdfGeneratorTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType>) => {
	return await resumePdfGeneratorExecute({ format, data, config });
};
