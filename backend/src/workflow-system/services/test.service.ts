import { Injectable } from '@nestjs/common';

import { loadNodeClass } from '../workflow-system.util';
import { GeneralNodeReturnType, ResponderDataFormatType } from '../workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

/**
 * @summary Workflow test service
 * @description Service for handling workflow test operations
 * @functions
 * - testNode
 * - testWorkflow
 */
@Injectable()
export class WorkflowTestService {
	constructor() {}

	/**
	 * Test node
	 */
	async testNode(props: {
		nodeType: string;
		format: ResponderDataFormatType;
		data: { defaultData: any } & Record<string, any>;
		config: Record<string, any>;
	}): Promise<DefaultReturnType<GeneralNodeReturnType>> {
		const { nodeType, format, data, config } = props;

		const nodeInstance = await loadNodeClass({ type: nodeType, category: 'general' });
		if (isError(nodeInstance)) {
			return {
				...nodeInstance,
				trace: ['WorkflowTestService - testNode - loadNodeClass'],
			};
		}

		const response = await nodeInstance.test({ format, data, config });
		if (isError(response)) {
			return {
				...response,
				trace: [...response.trace, 'WorkflowTestService - testNode - nodeInstance.test'],
			};
		}

		return response;
	}

	/**
	 * Test workflow
	 */
	async testWorkflow(workflowId: string) {
		return workflowId;
	}
}
