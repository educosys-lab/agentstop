import { cn } from '@/utils/theme.util';

import { usePlan } from './hooks/usePlan.hook';

export default function MissionExecutionCount() {
	const { currentExecutions, totalExecutions, isWarningZone, isDangerZone } = usePlan();

	return (
		<p
			className={cn(
				'mx-auto max-w-7xl pl-5',
				isWarningZone ? 'text-warn' : isDangerZone ? 'text-destructive' : 'text-blue-300',
			)}
		>
			Mission Executions = {currentExecutions}/{totalExecutions}
		</p>
	);
}
