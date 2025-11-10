import { NODES_REGISTRY } from './nodes/nodes.constant';
import GeneralBaseNode from './nodes/base-node/general/GeneralBaseNode';
import TriggerBaseNode from './nodes/base-node/trigger/TriggerBaseNode';
import ToolBaseNode from './nodes/base-node/tool/ToolBaseNode';
import ResponderBaseNode from './nodes/base-node/responder/ResponderBaseNode';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';

export const loadNodeClass = async <T extends 'general' | 'trigger' | 'responder' | 'tool' | 'all'>(props: {
	type: string;
	category: T;
}): Promise<
	DefaultReturnType<
		T extends 'general'
			? GeneralBaseNode
			: T extends 'trigger'
				? TriggerBaseNode
				: T extends 'responder'
					? ResponderBaseNode
					: T extends 'tool'
						? ToolBaseNode
						: GeneralBaseNode | TriggerBaseNode | ResponderBaseNode | ToolBaseNode
	>
> => {
	try {
		const { type, category } = props;

		if (!NODES_REGISTRY[type]) {
			return {
				userMessage: `Node ${type} not found!`,
				error: `Node ${type} not found!`,
				errorType: 'NotFoundException',
				errorData: { type, category },
				trace: ['loadNodeClass - if (!NODES_REGISTRY[type])'],
			};
		}

		const module = await import(NODES_REGISTRY[type]);
		const NodeClass = module.default;
		return new NodeClass();
	} catch (error) {
		return {
			userMessage: 'Invalid node type!',
			error: 'Invalid node type!',
			errorType: 'InternalServerErrorException',
			errorData: {
				props,
				error: returnErrorString(error),
			},
			trace: ['loadNodeClass - catch'],
		};
	}
};
