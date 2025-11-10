import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { parseJson } from 'src/shared/utils/json.util';
import { AgentOptionsEnum } from './agent-config.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const agentValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object({
		defaultData: z.unknown({ message: 'Invalid prompt data' }),
		workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
		memoryId: z.string({ message: 'Invalid memory ID' }).min(1, { message: 'Memory ID is required' }),
		userId: z.string({ message: 'Invalid id of user' }).min(1, { message: 'Id of user is required' }),
		userFullName: z.string({ message: 'Invalid name of user' }).min(1, { message: 'Name of user is required' }),
		tools: z.object({}, { message: 'Invalid tools' }).passthrough(),
		nextNodeAiPrompt: z.string({ message: 'Invalid next node AI prompt' }).optional(),
		nextNodeSchema: z
			.array(
				z.object(
					{
						id: z.string({ message: 'Invalid node ID' }).min(1, { message: 'Node ID is required' }),
						type: z.string({ message: 'Invalid node type' }).min(1, { message: 'Node type is required' }),
						props: z.object({}, { message: 'Invalid node props' }).passthrough(),
					},
					{ message: 'Invalid node schema' },
				),
			)
			.optional(),
	}),
	config: z.object(
		{
			apiKey: z.string({ message: 'Invalid API key' }).min(1, { message: 'API key is required' }),
			model: z.nativeEnum(AgentOptionsEnum, { message: 'Invalid model' }),
			systemPrompt: z.string({ message: 'Invalid system prompt' }).optional(),
			llmHasMemory: z.string({ message: 'Invalid LLM has memory' }).optional(),
		},
		{ message: 'Invalid agent config' },
	),
});

export type AgentDataType = z.infer<typeof agentValidationSchema>['data'] & { defaultData: unknown };
export type AgentConfigType = z.infer<typeof agentValidationSchema>['config'];

export const agentValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<AgentDataType, AgentConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<AgentDataType, AgentConfigType>>
> => {
	const parsedDefaultData = format === 'json' ? parseJson(data.defaultData) : data.defaultData;
	if (isError(parsedDefaultData)) {
		return {
			...parsedDefaultData,
			trace: [...parsedDefaultData.trace, 'agentValidate - parseJson'],
		} as DefaultReturnType<GeneralNodeValidateReturnType<AgentDataType, AgentConfigType>>;
	}

	const validationResult = validate({ data: { format, data, config }, schema: agentValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'agentValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: parsedDefaultData },
		config: validationResult.config,
	};
};
