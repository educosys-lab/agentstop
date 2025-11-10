import { useAppSelector } from '@/store/hook/redux.hook';

export const usePlan = () => {
	const currentExecutions = useAppSelector((state) => state.workflowState.currentExecutions);
	const totalExecutions = useAppSelector((state) => state.workflowState.totalExecutions);

	const executionExhaustedPercentage = (currentExecutions / totalExecutions) * 100;
	const isWarningZone = executionExhaustedPercentage >= 80 && executionExhaustedPercentage < 95;
	const isDangerZone = executionExhaustedPercentage >= 95;

	return {
		currentExecutions,
		totalExecutions,
		executionExhaustedPercentage,
		isWarningZone,
		isDangerZone,
	};
};
