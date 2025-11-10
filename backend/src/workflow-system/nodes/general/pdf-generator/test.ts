import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { pdfGeneratorExecute } from './execute';
import { PdfGeneratorDataType, PdfGeneratorConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const pdfGeneratorTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<PdfGeneratorDataType, PdfGeneratorConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await pdfGeneratorExecute({ format, data, config });
};
