import { UserSsoConfigType } from '@/types/user.type';

export type WorkflowNodeMetaType = {
	type: string;
	label: string;
	description: string;
	version: string;
	category: 'Action' | 'Agent' | 'LLM' | 'Responder' | 'Trigger' | 'Tool' | 'System';
	icon: string;
	hidden?: boolean;
};

export type NodeValidationType = {
	field: string;
	label: string;
	type: 'string' | 'number' | 'array' | 'object' | 'boolean';
	required?: boolean;
	validValues?: string[];
	regex?: RegExp;
	isSensitiveData?: boolean;
	provider?: UserSsoConfigType['provider'];
};

type BaseNodeConfigType = {
	name: string;
	label: string;
	description:
		| string
		| { text: string; url: string }
		| {
				text: string;
				url?: string;
				showWhen: { field: string; value?: any; validValues?: string[] };
		  }[];
	placeholder?: string;
	defaultValue?: string;
	showWhen?: { field: string; value: string };
	showButton?: { field: string; value: string; type: UserSsoConfigType['provider'] };
	validation: NodeValidationType[];
};

export type TextNodeConfigType = BaseNodeConfigType & { type: 'text' };

export type TextareaNodeConfigType = BaseNodeConfigType & { type: 'textarea' };

export type SelectNodeConfigType = BaseNodeConfigType & {
	type: 'select' | 'select-google-account' | 'select-google-docs' | 'select-google-sheets';
	options: { value: string; label: string }[] | { category: string; options: { value: string; label: string }[] }[];
	isMultiSelect?: boolean;
};

export type CheckboxNodeConfigType = Omit<BaseNodeConfigType, 'placeholder'> & {
	type: 'checkbox';
	options: { value: string; label: string }[];
};

export type RadioNodeConfigType = Omit<BaseNodeConfigType, 'placeholder'> & {
	type: 'radio';
	options: { value: string; label: string }[];
};

export type DateTimeNodeConfigType = Omit<BaseNodeConfigType, 'placeholder'> & { type: 'date-time' };

export type ImageNodeConfigType = Omit<BaseNodeConfigType, 'placeholder' | 'validation'> & {
	type: 'image';
	src: string | { value: string; showWhen: { field: string; value?: any; validValues?: string[] } }[];
};

export type NodeConfigType =
	| TextNodeConfigType
	| TextareaNodeConfigType
	| SelectNodeConfigType
	| CheckboxNodeConfigType
	| RadioNodeConfigType
	| DateTimeNodeConfigType
	| ImageNodeConfigType;

export type WorkflowToolDataType = {
	metadata: WorkflowNodeMetaType;
	config: NodeConfigType[];
};
