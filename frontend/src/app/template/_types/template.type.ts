import { WorkflowType } from '@/app/workflow/_types/workflow.type';

export type TemplateType = {
	id: string;
	title: WorkflowType['title'];
	category: string;
	subCategory: string;
	preview: WorkflowType['preview'];
	notes: WorkflowType['notes'];
	viewed: number;
	used: number;
	icons: string[];
};

export type AddTemplateType = Omit<TemplateType, 'id' | 'viewed' | 'used' | 'icons'>;
