import { LucideIconType } from '@/types/lucide.type';
import { ReactFlowNode } from './workflow-editor.type';

export type WorkflowNodeListProps = {
	name: string;
	onClick: () => void;
	image?: string;
	category: ReactFlowNode['category'];
	description: string;
	icon?: LucideIconType;
	search: string[];
};
