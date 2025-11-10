import { z } from 'zod';

export const createInteractValidation = z.object({
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	workflowCreatedBy: z
		.string({ message: 'Invalid workflow created by' })
		.min(1, { message: 'Workflow Created By is required' }),
});

export const deleteInteractValidation = z.object({
	userId: z.string({ message: 'Invalid user ID' }).optional(),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
});

export const deleteInteractInternalValidation = deleteInteractValidation.omit({ userId: true });
