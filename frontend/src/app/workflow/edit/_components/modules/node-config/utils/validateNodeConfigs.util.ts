import { WorkflowType } from '@/app/workflow/_types/workflow.type';
import { NodeValidationType } from '../../../types/tool-node-config.type';

import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

export const validateNodeConfigs = (props: {
	nodeType: string;
	data: WorkflowType['config'] | undefined;
	skipEmptyFields?: boolean;
}): boolean | { [field: string]: string } => {
	const { nodeType, data, skipEmptyFields } = props;

	const nodesData = workflowStoreSynced.getState().nodesData;
	if (!nodesData) return false;

	const selectedNode = nodesData.find((node) => node.metadata.type === nodeType);
	if (!selectedNode) return false;

	const config = selectedNode.config;
	const allValidations = config.reduce((acc, curr) => {
		if (!('validation' in curr)) return acc;
		curr.validation.forEach((rule) => acc.push(rule));
		return acc;
	}, [] as NodeValidationType[]);

	const errors: { [field: string]: string } = {};

	allValidations.forEach((item) => {
		const { field, label, type, required, validValues, regex, provider } = item;
		const value = data ? data[field] : undefined;

		if (required && !value && !skipEmptyFields) {
			let errorMessage = '';

			if (['access_token', 'refresh_token'].includes(field)) {
				if (provider === 'google') errorMessage = 'No Google account selected!';
			} else {
				errorMessage = `${label} is required`;
			}

			return (errors[field] = `${errorMessage}`);
		}
		if (type === 'array' && !Array.isArray(value)) {
			return (errors[field] = `${label} must be an array`);
		}
		if (type !== 'array' && typeof value !== type) {
			return (errors[field] = `${label} must be a ${type} value`);
		}
		if (validValues && !validValues.includes(value)) {
			return (errors[field] = `${label} must be one of the given options`);
		}
		if (regex && !regex.test(value)) {
			return (errors[field] = `${label} is not valid`);
		}
	});

	if (Object.keys(errors).length > 0) return errors;
	return true;
};
