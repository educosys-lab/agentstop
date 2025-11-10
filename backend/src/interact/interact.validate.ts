import { z } from 'zod';

import { responderDataFormats } from 'src/workflow-system/workflow-system.type';

export const getInteractValidation = z.object({
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
});

export const getUserInteractsValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
});

export const addMessageValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	id: z.string({ message: 'Invalid chat ID' }).min(1, { message: 'Chat ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	content: z.string({ message: 'Invalid content' }).min(1, { message: 'Content is required' }),
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	isInternal: z.boolean({ message: 'Invalid internal flag' }).optional(),
	showTempData: z.boolean({ message: 'Invalid show temp data flag' }).optional(),
});

export const addMembersValidation = z.object({
	workflowId: z.string({ message: 'Invalid chat ID' }).min(1, { message: 'Chat ID is required' }),
	emailOrUsername: z.array(
		z.string({ message: 'Invalid email or username' }).min(1, { message: 'Email or Username is required' }),
		{ message: 'Email or Username is required' },
	),
});

export const deleteMembersValidation = addMembersValidation;
