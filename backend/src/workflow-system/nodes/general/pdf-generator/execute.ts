import puppeteer from 'puppeteer';
import { v4 as uuid } from 'uuid';

import { PdfGeneratorConfigType, PdfGeneratorDataType, pdfGeneratorValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { formatLLMResponseToText } from 'src/shared/utils/ai.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';
import { saveFile } from 'src/shared/upload/file.service';

export const pdfGeneratorExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<PdfGeneratorDataType, PdfGeneratorConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await pdfGeneratorValidate({ format, data, config });
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'pdfGeneratorExecute - pdfGeneratorValidate'],
			};
		}

		const { defaultData } = validate.data;

		const formattedDefaultData =
			typeof defaultData === 'string' ? formatLLMResponseToText(defaultData) : JSON.stringify(defaultData);
		if (isError(formattedDefaultData)) {
			return {
				...formattedDefaultData,
				trace: [...formattedDefaultData.trace, 'pdfGeneratorExecute - formatLLMResponseToText'],
			};
		}

		const browser = await puppeteer.launch({
			executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.setContent(formattedDefaultData);
		const buffer = await page.pdf({ format: 'A4' });
		await browser.close();

		const uploadFileResponse = await saveFile({ buffer, originalName: `${uuid()}.pdf` });
		if (isError(uploadFileResponse)) {
			return {
				...uploadFileResponse,
				trace: [...uploadFileResponse.trace, 'pdfGeneratorExecute - saveFile'],
			};
		}

		return { status: 'success', format: 'string', content: { defaultData: uploadFileResponse.url } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['pdfGeneratorExecute - catch'],
		};
	}
};
