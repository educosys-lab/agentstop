import { TriangleAlertIcon } from 'lucide-react';

import { cn } from '@/utils/theme.util';

import { usePlan } from './hooks/usePlan.hook';

export default function MonthlyLimit() {
	const { currentExecutions, isWarningZone, isDangerZone } = usePlan();

	if (currentExecutions < 80) return null;
	return (
		<div className="fixed inset-[80px_0_auto_0] mx-auto flex max-w-md flex-col gap-2.5 px-2">
			<div
				className={cn(
					'flex items-center gap-3 rounded-lg px-4 py-3',
					isWarningZone ? 'bg-warn-dark/25' : isDangerZone ? 'bg-destructive-dark/25' : '',
				)}
			>
				<TriangleAlertIcon
					className={cn(
						'size-6 shrink-0',
						isWarningZone ? 'text-warn' : isDangerZone ? 'text-destructive' : '',
					)}
				/>
				<div>
					<h5>Monthly limit</h5>
					<p>
						{isWarningZone
							? 'Your monthly execution limit is about to be reached!'
							: isDangerZone
								? 'You have exhausted your monthly execution limit!'
								: ''}
					</p>
				</div>
			</div>
		</div>
	);
}
