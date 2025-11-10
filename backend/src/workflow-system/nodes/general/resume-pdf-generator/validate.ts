import { z } from 'zod';
import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { templateOptions } from './resume-pdf-generator.data';

interface AiDataType {
	image_ifAny?: string;
	name?: string;
	title?: string;
	summary?: string;
	mobile?: string;
	email?: string;
	address?: string;
	website_ifAny?: string;
	linkedin_ifAny?: string;
	educations?: string;
	experiences?: string;
	skills?: string;
	languages?: string;
}

const resumePdfGeneratorValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{
			defaultData: z.unknown({ message: 'Invalid content' }).optional(),
			image_ifAny: z.string({ message: 'Invalid image URL' }).optional(),
			name: z.string({ message: 'Invalid name' }).optional(),
			title: z.string({ message: 'Invalid title' }).optional(),
			summary: z.string({ message: 'Invalid summary' }).optional(),
			mobile: z.string({ message: 'Invalid mobile' }).optional(),
			email: z.string({ message: 'Invalid email' }).optional(),
			address: z.string({ message: 'Invalid address' }).optional(),
			website_ifAny: z.string({ message: 'Invalid website URL' }).optional(),
			linkedin_ifAny: z.string({ message: 'Invalid LinkedIn URL' }).optional(),
			educations: z.string({ message: 'Invalid educations' }).optional(),
			experiences: z.string({ message: 'Invalid experiences' }).optional(),
			skills: z.string({ message: 'Invalid skills' }).optional(),
			languages: z.string({ message: 'Invalid languages' }).optional(),
		},
		{ message: 'Invalid resume data' },
	),
	config: z.object(
		{
			template_type: z.enum(templateOptions.map((option) => option.value) as [string, ...string[]], {
				message: 'Invalid template type',
			}),
		},
		{ message: 'Invalid resume config' },
	),
});

const templateDataSchema = z.object({
	image: z
		.string({ message: 'Invalid image URL' })
		.optional()
		.or(z.literal(''))
		.default('https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg'),
	name: z.string({ message: 'Invalid name' }).default('Unknown Name'),
	title: z.string({ message: 'Invalid title' }).default('Professional'),
	summary: z.string({ message: 'Invalid summary' }).default('No summary provided.'),
	mobile: z.string({ message: 'Invalid mobile' }).default('Not provided'),
	email: z.string({ message: 'Invalid email' }).optional().or(z.literal('')).default('not-provided@example.com'),
	address: z.string({ message: 'Invalid address' }).default('Not provided'),
	website: z.string({ message: 'Invalid website URL' }).optional().default('https://example.com'),
	linkedin: z.string({ message: 'Invalid LinkedIn URL' }).optional().default('https://linkedin.com/in/example'),
	educations: z
		.string({ message: 'Invalid educations' })
		.transform((val) => (val ? JSON.parse(val) : []))
		.refine((val) => Array.isArray(val), { message: 'educations must be a valid JSON array' })
		.default('[]'),
	experiences: z
		.string({ message: 'Invalid experiences' })
		.transform((val) => (val ? JSON.parse(val) : []))
		.refine((val) => Array.isArray(val), { message: 'experiences must be a valid JSON array' })
		.default('[]'),
	skills: z
		.string({ message: 'Invalid skills' })
		.transform((val) => (val ? JSON.parse(val) : []))
		.refine((val) => Array.isArray(val), { message: 'skills must be a valid JSON array' })
		.default('[]'),
	languages: z.string({ message: 'Invalid languages' }).default(''),
});

export type ResumePdfGeneratorDataType = z.infer<typeof resumePdfGeneratorValidationSchema>['data'] & {
	defaultData: unknown;
};
export type ResumePdfGeneratorConfigType = z.infer<typeof resumePdfGeneratorValidationSchema>['config'];

export const resumePdfGeneratorValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<ResumePdfGeneratorDataType, ResumePdfGeneratorConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: resumePdfGeneratorValidationSchema });
	if ('error' in validationResult) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'resumePdfGeneratorValidate - resumePdfGeneratorValidationSchema'],
		};
	}

	let parsedData: AiDataType = {};
	if (typeof data.defaultData === 'string') {
		try {
			parsedData = JSON.parse(data.defaultData) as AiDataType;
		} catch {
			// Empty Block
		}
	}

	const inputData = {
		image: parsedData.image_ifAny || data.image_ifAny || '',
		name: parsedData.name || data.name || '',
		title: parsedData.title || data.title || '',
		summary: parsedData.summary || data.summary || '',
		mobile: parsedData.mobile || data.mobile || '',
		email: parsedData.email || data.email || '',
		address: parsedData.address || data.address || '',
		website: parsedData.website_ifAny || data.website_ifAny || '',
		linkedin: parsedData.linkedin_ifAny || data.linkedin_ifAny || '',
		educations: parsedData.educations || data.educations || '[]',
		experiences: parsedData.experiences || data.experiences || '[]',
		skills: parsedData.skills || data.skills || '[]',
		languages: parsedData.languages || data.languages || '',
	};

	const templateParse = templateDataSchema.safeParse(inputData);

	if (templateParse.success) {
		return {
			format: format || 'string',
			data: {
				defaultData: templateParse.data,
				image_ifAny: data.image_ifAny,
				name: data.name,
				title: data.title,
				summary: data.summary,
				mobile: data.mobile,
				email: data.email,
				address: data.address,
				website_ifAny: data.website_ifAny,
				linkedin_ifAny: data.linkedin_ifAny,
				educations: data.educations,
				experiences: data.experiences,
				skills: data.skills,
				languages: data.languages,
			},
			config: validationResult.config,
		};
	} else {
		return {
			userMessage: 'Invalid resume data',
			error: templateParse.error.message,
			errorType: 'BadRequestException',
			errorData: {
				zodError: templateParse.error,
			},
			trace: ['resumePdfGeneratorValidate - templateDataSchema'],
		};
	}
};
