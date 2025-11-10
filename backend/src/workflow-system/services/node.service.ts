import { Injectable } from '@nestjs/common';

import { NODES_REGISTRY } from '../nodes/nodes.constant';
import { log } from 'src/shared/logger/logger';
import { loadNodeClass } from '../workflow-system.util';
import { NodeConfigType, NodeMetadataType } from '../workflow-system.type';
import ResponderBaseNode from '../nodes/base-node/responder/ResponderBaseNode';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow node service
 * @description Service for handling workflow nodes
 * @functions
 * - getAllNodes
 */
@Injectable()
export class WorkflowNodeService {
	constructor() {}

	/**
	 * Get all nodes
	 */
	async getAllNodes(): Promise<DefaultReturnType<{ metadata: NodeMetadataType; config: NodeConfigType[] }[]>> {
		const allNodesKeys = Object.keys(NODES_REGISTRY);

		const allNodes: { metadata: NodeMetadataType; config: NodeConfigType[] }[] = [];

		for (const nodeKey of allNodesKeys) {
			const nodeInstance = await loadNodeClass({ type: nodeKey, category: 'all' });
			if (isError(nodeInstance)) {
				log('workflow', 'error', {
					message: nodeInstance.userMessage,
					data: nodeInstance.errorData,
					trace: [...nodeInstance.trace, 'WorkflowNodeService_getAllNodes - loadNodeClass'],
				});
				continue;
			}

			allNodes.push({
				metadata: nodeInstance.metadata,
				config: nodeInstance instanceof ResponderBaseNode ? [] : nodeInstance.config,
			});
		}

		return allNodes;
	}
}
