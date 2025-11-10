import { Injectable } from '@nestjs/common';

import { EdgeType, NodeType, WorkflowType } from 'src/workflow/workflow.type';
import { ConnectionMapType, NodeMapType } from '../workflow-system.type';
import { loadNodeClass } from '../workflow-system.util';
import GeneralBaseNode from '../nodes/base-node/general/GeneralBaseNode';
import ToolBaseNode from '../nodes/base-node/tool/ToolBaseNode';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow parser service
 * @description Service for parsing workflows
 * @functions
 * - getTriggerNodes
 * - getConnectionMap
 *
 * @private
 * - getNodeConnections
 * - getNodeMap
 */
@Injectable()
export class WorkflowParserService {
	constructor() {}

	/**
	 * Get trigger nodes
	 */
	getTriggerNodes(props: {
		userId: string;
		workflowId: string;
		nodes: NodeType[];
		edges: EdgeType[];
	}): DefaultReturnType<NodeType[]> {
		const { userId, workflowId, nodes, edges } = props;

		const triggerNodes = nodes.filter((node) => node.category === 'Trigger');
		if (triggerNodes.length === 0) {
			return {
				userMessage: 'No trigger node found!',
				error: 'No trigger node found!',
				errorType: 'InternalServerErrorException',
				errorData: { userId, workflowId },
				trace: ['WorkflowParserService - getTriggerNodes - if (triggerNodes.length === 0)'],
			};
		}

		const triggerNodeIds = triggerNodes.map((node) => node.id);
		const targetNodeIds = edges.map((edge) => edge.target);

		if (triggerNodeIds.some((id) => targetNodeIds.includes(id))) {
			return {
				userMessage: 'Trigger node cannot be a target node!',
				error: 'Trigger node cannot be a target node!',
				errorType: 'InternalServerErrorException',
				errorData: { userId, workflowId },
				trace: [
					'WorkflowParserService - getTriggerNodes - if (triggerNodeIds.some((id) => targetNodeIds.includes(id)))',
				],
			};
		}

		return triggerNodes;
	}

	/**
	 * Get connection map
	 */
	async getConnectionMap(
		workflow: WorkflowType,
	): Promise<DefaultReturnType<{ connectionMap: ConnectionMapType; nodeMap: NodeMapType }>> {
		const connectionMap = this.getNodeConnections(workflow);
		if (isError(connectionMap)) {
			return {
				...connectionMap,
				trace: [...connectionMap.trace, 'WorkflowParserService - getConnectionMap - getNodeConnections'],
			} as DefaultReturnType<{ connectionMap: ConnectionMapType; nodeMap: NodeMapType }>;
		}

		const nodeMap = await this.getNodeMap(workflow);
		if (isError(nodeMap)) {
			return {
				...nodeMap,
				trace: [...nodeMap.trace, 'WorkflowParserService - getConnectionMap - getNodeMap'],
			} as DefaultReturnType<{ connectionMap: ConnectionMapType; nodeMap: NodeMapType }>;
		}

		return { connectionMap, nodeMap };
	}

	/**
	 * Get node connections
	 */
	private getNodeConnections(workflow: WorkflowType): DefaultReturnType<ConnectionMapType> {
		try {
			const { nodes, edges } = workflow;
			const connectionMap: ConnectionMapType = {};

			const nodeMap = new Map(nodes.map((node) => [node.id, node]));
			const nodeIds = new Set(nodeMap.keys());

			// Initialize empty connection map entries for all valid nodes
			for (const nodeId of nodeIds) {
				connectionMap[nodeId] = { previousNodeIds: [], nextNodeIds: [], toolNodeIds: [] };
			}

			for (const edge of edges) {
				const { source, target } = edge;

				// Skip if source or target doesn't exist in node list
				if (!nodeIds.has(source) || !nodeIds.has(target)) continue;

				const sourceNode = nodeMap.get(source)!;
				const targetNode = nodeMap.get(target)!;

				const sourceIsTool = sourceNode.category === 'Tool';
				const targetIsTool = targetNode.category === 'Tool';

				const sourceIsAgent = sourceNode.type === 'agent';
				const targetIsAgent = targetNode.type === 'agent';

				if (sourceIsTool && targetIsAgent && connectionMap[target]) {
					connectionMap[target].toolNodeIds.push(source);
					continue;
				}

				if (targetIsTool && sourceIsAgent && connectionMap[source]) {
					connectionMap[source].toolNodeIds.push(target);
					continue;
				}

				// Normal node-to-node connections
				if (!sourceIsTool && !targetIsTool) {
					connectionMap[source].nextNodeIds.push(target);
					connectionMap[target].previousNodeIds.push(source);
				}
			}

			return connectionMap;
		} catch (error) {
			return {
				userMessage: 'Error generating connections!',
				error: 'Error generating connection map!',
				errorType: 'InternalServerErrorException',
				errorData: {
					workflowId: workflow.id,
					error: returnErrorString(error),
				},
				trace: ['WorkflowParserService - getNodeConnections - catch'],
			};
		}
	}

	/**
	 * Get node map
	 */
	private async getNodeMap(workflow: WorkflowType): Promise<DefaultReturnType<NodeMapType>> {
		const nodeMap: NodeMapType = {};

		for (const node of workflow.nodes) {
			const nodeInstance = await loadNodeClass({ type: node.type, category: 'all' });
			if (isError(nodeInstance)) {
				return {
					...nodeInstance,
					trace: [...nodeInstance.trace, 'WorkflowParserService - getNodeMap - loadNodeClass'],
				};
			}

			if (nodeInstance instanceof ToolBaseNode) {
				try {
					const isValid = await nodeInstance.validate({ config: workflow.config[node.id] });
					if (isError(isValid)) {
						return {
							...isValid,
							trace: [...isValid.trace, 'WorkflowParserService - getNodeMap - nodeInstance.validate'],
						};
					}
				} catch (error) {
					return {
						userMessage: `Tool node config is invalid (${node.type})!`,
						error: `Tool node config is invalid (${node.type})!`,
						errorType: 'BadRequestException',
						errorData: {
							workflowId: workflow.id,
							error: returnErrorString(error),
						},
						trace: ['WorkflowParserService - getNodeMap - nodeInstance.validate'],
					};
				}
			}

			nodeMap[node.id] = {
				type: node.type,
				category: node.category,
				config: workflow.config[node.id] || {},
			};

			if (nodeInstance instanceof GeneralBaseNode && nodeInstance.aiGenerateProps) {
				nodeMap[node.id].aiGenerateProps = nodeInstance.aiGenerateProps;
			}
			if (nodeInstance instanceof GeneralBaseNode && nodeInstance.aiPrompt) {
				nodeMap[node.id].aiPrompt = nodeInstance.aiPrompt;
			}
		}

		return nodeMap;
	}
}
