import puppeteer from 'puppeteer';
import { v4 as uuid } from 'uuid';

import { template_1 } from './template/template_1';
import { template_2 } from './template/template_2';
import { template_3 } from './template/template_3';
import { ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType, resumePdfGeneratorValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { saveFile } from 'src/shared/upload/file.service';
import { isError } from 'src/shared/utils/error.util';

export const resumePdfGeneratorExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await resumePdfGeneratorValidate({ format, data, config });
		if ('error' in validate) {
			return {
				...validate,
				trace: [...validate.trace, 'resumePdfGeneratorExecute - resumePdfGeneratorValidate'],
			};
		}

		const templateData = validate.data.defaultData as {
			image: string;
			name: string;
			title: string;
			summary: string;
			mobile: string;
			email: string;
			address: string;
			website: string;
			linkedin: string;
			educations: { degree: string; institution: string; date: string }[];
			experiences: { title: string; company: string; date: string; achievements: string[] }[];
			skills: { category: string; skills: string }[];
			languages: string;
		};

		const {
			image,
			name,
			title,
			summary,
			mobile,
			email,
			address,
			website,
			linkedin,
			educations,
			experiences,
			skills,
			languages,
		} = templateData;

		const browser = await puppeteer.launch({
			executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();

		const templateMap = {
			template_1,
			template_2,
			template_3,
		};
		const selectedTemplate = templateMap[config.template_type] || template_1; // Default to template_1 if invalid

		const template = selectedTemplate({
			image,
			name,
			title,
			summary,
			mobile,
			email,
			address,
			website,
			linkedin,
			educations,
			experiences,
			skills,
			languages,
		});
		await page.setContent(template);

		const buffer = await page.pdf({ format: 'A4' });

		const uploadFileResponse = await saveFile({ buffer, originalName: `${uuid()}.pdf` });
		if (isError(uploadFileResponse)) {
			return {
				...uploadFileResponse,
				trace: [...uploadFileResponse.trace, 'resumePdfGeneratorExecute - saveFile'],
			};
		}

		await browser.close();

		return {
			status: 'success',
			format: 'string',
			content: {
				defaultData: `${uploadFileResponse.url} (Note: This resume link will expire in 1 hour)`,
			},
		};
	} catch (error) {
		return {
			userMessage: 'Resume generation failed',
			error: returnErrorString(error),
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['resumePdfGeneratorExecute - catch'],
		};
	}
};
