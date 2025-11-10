import { z } from 'zod';

import { MAX_TITLE_LENGTH } from './workflow.constant';

export const getWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
});

export const getUserWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
});

export const getUserDeletedWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
});

export const createWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
	title: z
		.string({ message: 'Invalid title' })
		.min(1, 'Title is required')
		.max(MAX_TITLE_LENGTH, 'Title is too long'),
});

export const createWorkflowWithTemplateValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
	template: z.object(
		{
			edges: z.array(z.object({}, { message: 'Invalid edges' }).passthrough(), { message: 'Invalid edges' }),
			nodes: z
				.array(z.object({}, { message: 'Invalid nodes' }).passthrough(), { message: 'Invalid nodes' })
				.optional(),
			preview: z.string({ message: 'Invalid preview' }),
			notes: z.string({ message: 'Invalid notes' }).optional(),
		},
		{ message: 'Invalid template' },
	),
});

const updateWorkflowUpdatesValidation = z.object(
	{
		title: z.string({ message: 'Invalid title' }).max(MAX_TITLE_LENGTH, 'Title is too long').optional(),
		nodes: z
			.array(z.object({}, { message: 'Invalid nodes' }).passthrough(), { message: 'Invalid nodes' })
			.optional(),
		edges: z
			.array(z.object({}, { message: 'Invalid edges' }).passthrough(), { message: 'Invalid edges' })
			.optional(),
		isPublic: z.boolean().optional(),
		preview: z.string({ message: 'Invalid preview' }).optional(),
		notes: z.string({ message: 'Invalid notes' }).optional(),
		status: z.string({ message: 'Invalid status' }).optional(),
		config: z
			.array(z.object({}, { message: 'Invalid config' }).passthrough(), { message: 'Invalid config' })
			.optional(),
		report: z.object({}, { message: 'Invalid report' }).passthrough().optional(),
		generalSettings: z
			.object(
				{ showResultFromAllNodes: z.boolean({ message: 'Invalid prop in settings' }).optional() },
				{ message: 'Invalid settings' },
			)
			.passthrough()
			.optional(),
	},
	{ message: 'Invalid workflow updates' },
);

export const updateWorkflowValidation = z.object({
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
	userId: z.string({ message: 'Invalid user ID' }).optional(),
	updates: updateWorkflowUpdatesValidation,
});

// export const updateCompleteWorkflowUpdatesValidation = updateWorkflowUpdatesValidation
// 	.omit({ config: true, report: true })
// 	.extend({
// 		config: z.object({}, { message: 'Invalid config' }).passthrough().optional(),
// 		report: z.object({}, { message: 'Invalid report' }).passthrough().optional(),
// 	});

// export const updateCompleteWorkflowValidation = z.object({
// 	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
// 	userId: z.string({ message: 'Invalid user ID' }).optional(),
// 	updates: updateCompleteWorkflowUpdatesValidation,
// });

export const deleteWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
});

export const restoreWorkflowValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, 'User ID is required'),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
});

export const getWorkflowInternalValidation = z.object({
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, 'Workflow ID is required'),
});

export const getMultipleWorkflowsInternalValidation = z.object({
	workflowIds: z.array(z.string({ message: 'Invalid workflow ID' })).optional(),
});

export const updateWorkflowInternalValidation = updateWorkflowValidation.omit({
	userId: true,
});
