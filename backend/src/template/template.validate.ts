import { z } from 'zod';

import { MAX_TITLE_LENGTH } from './template.constant';

export const addTemplateValidation = z.object({
	title: z
		.string({ message: 'Invalid template title' })
		.min(1, { message: 'Template title is required' })
		.max(MAX_TITLE_LENGTH, {
			message: `Template title must be less than ${MAX_TITLE_LENGTH} characters`,
		}),
	category: z.string({ message: 'Invalid category' }).min(1, { message: 'Category is required' }),
	subCategory: z.string({ message: 'Invalid sub-category' }).min(1, { message: 'Sub-category is required' }),
	nodes: z.array(z.object({}, { message: 'Invalid nodes' }).passthrough(), { message: 'Invalid nodes' }),
	edges: z.array(z.object({}, { message: 'Invalid edges' }).passthrough(), { message: 'Invalid edges' }),
	preview: z.string({ message: 'Invalid preview' }).optional(),
	notes: z.string({ message: 'Invalid notes' }).optional(),
});

export const updateTemplateValidation = z.object({
	id: z.string({ message: 'Invalid template id' }).min(1, { message: 'Template id is required' }),
	updates: z.object(
		{
			title: z
				.string({ message: 'Invalid template title' })
				.max(MAX_TITLE_LENGTH, {
					message: `Template title must be less than ${MAX_TITLE_LENGTH} characters`,
				})
				.optional(),
			category: z.string({ message: 'Invalid category' }).optional(),
			subCategory: z.string({ message: 'Invalid sub-category' }).optional(),
			nodes: z
				.array(z.object({}, { message: 'Invalid nodes' }).passthrough(), { message: 'Invalid nodes' })
				.optional(),
			edges: z
				.array(z.object({}, { message: 'Invalid edges' }).passthrough(), { message: 'Invalid edges' })
				.optional(),
			preview: z.string({ message: 'Invalid preview' }).optional(),
			notes: z.string({ message: 'Invalid notes' }).optional(),
		},
		{ message: 'Invalid template updates' },
	),
});

export const deleteTemplateValidation = z.object({
	templateId: z.string({ message: 'Invalid template id' }).min(1, { message: 'Template id is required' }),
});

export const useTemplateValidation = z.object({
	userId: z.string({ message: 'Invalid user id' }).min(1, { message: 'User id is required' }),
	templateId: z.string({ message: 'Invalid template id' }).min(1, { message: 'Template id is required' }),
});
