import { TriggerMetadataType } from 'src/workflow-system/workflow-system.type';

export const cronTriggerMetadata: TriggerMetadataType = {
	type: 'cron-trigger',
	label: 'Scheduler',
	description: 'Run mission at set times or intervals',
	version: '1.0.0',
	category: 'Trigger',
	icon: `${process.env.BACKEND_URL}/assets/node-images/trigger-cron.svg`,
};
