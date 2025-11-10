import { WorkflowType } from 'src/workflow/workflow.type';

export type TemplateType = {
	id: string;
	title: WorkflowType['title'];
	category: string;
	subCategory: string;
	nodes: WorkflowType['nodes'];
	edges: WorkflowType['edges'];
	preview: WorkflowType['preview'];
	notes: WorkflowType['notes'];
	viewed: number;
	used: number;
	icons: string[];
};

export type GetTemplateType = Omit<TemplateType, 'nodes' | 'edges'>;

export type AddTemplateType = Omit<TemplateType, 'id' | 'viewed' | 'used' | 'icons'>;

export type UpdateTemplateType = Partial<Omit<TemplateType, 'id'>>;
