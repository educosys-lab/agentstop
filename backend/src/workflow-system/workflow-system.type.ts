import { NodeType, WorkflowType } from 'src/workflow/workflow.type';
import { NODES_REGISTRY } from './nodes/nodes.constant';
import { UserSsoConfigType, UserType } from 'src/user/user.type';
import { TelegramResponderConfigType } from './nodes/responders/telegram/validate';
import { InteractResponderConfigType } from './nodes/responders/interact/validate';
import { DiscordResponderConfigType } from './nodes/responders/discord/validate';
import { SlackResponderConfigType } from './nodes/responders/slack/validate';
import { CronDummyResponderConfigType } from './nodes/triggers/cron/Cron';
import { GoogleSheetsResponderConfigType } from './nodes/responders/google-sheets/validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { WhatsAppResponderConfigType } from './nodes/responders/whatsapp/validate';
import { WebhookResponderConfigType } from './nodes/responders/webhook/validate';

// ========= Workflow Cache Types ========== //
export type ConnectionMapType = {
	[currentNodeId: NodeType['id']]: {
		previousNodeIds: NodeType['id'][];
		nextNodeIds: NodeType['id'][];
		toolNodeIds: NodeType['id'][];
	};
};

export type NodeMapType = {
	[currentNodeId: NodeType['id']]: {
		type: NodeVariantType;
		category: NodeMetadataType['category'] | 'System';
		config: WorkflowType['config'];
		aiGenerateProps?: NodeAiGeneratePropsType;
		aiPrompt?: string;
	};
};

export type WorkflowCacheType = {
	workflowId: WorkflowType['id'];
	connectionMap: ConnectionMapType;
	nodeMap: NodeMapType;
	generalSettings: WorkflowType['generalSettings'];
};

export type ExecutionCacheType = {
	userId: UserType['id'];
	userFullName: string;
	workflowId: WorkflowType['id'];
	executionId: string;
	triggerDetails: ResponderNodeConfigType;
	allResponses: {
		[nodeId: string]: {
			format: ResponderDataFormatType;
			content: { defaultData: any } & Record<string, any>;
		};
	};
};

// ========= Workflow Nodes ========== //
export type NodeVariantType = keyof typeof NODES_REGISTRY;

export type GetNodeConfigType = {
	metadata: NodeMetadataType;
	config: NodeConfigType[];
};

// ========= Workflow General Node Types ========== //
export type MetadataType = {
	type: NodeVariantType;
	label: string;
	description: string;
	version: string;
	category: 'Action' | 'Agent' | 'LLM';
	icon: string;
	hidden?: boolean;
};

export type GeneralNodePropsType<DataType extends { defaultData: any }, ConfigType> = {
	format: ResponderDataFormatType;
	data: DataType;
	config: ConfigType;
};

export type GeneralNodeReturnType =
	| {
			status: 'success';
			format: ResponderDataFormatType;
			content: { defaultData: any } & Record<string, any>;
	  }
	| { status: 'hold'; format: 'string'; content: string };

export type GeneralNodeValidateReturnType<DataType, ConfigType> = {
	format: ResponderDataFormatType;
	data: DataType;
	config: ConfigType;
};

// ========= Workflow Trigger Node Types ========== //
export type TriggerMetadataType = Omit<MetadataType, 'category'> & {
	category: 'Trigger';
};

export type TriggerCallbackType = (props: {
	userId: UserType['id'];
	workflowId: WorkflowType['id'];
	data: any;
	format: ResponderDataFormatType;
	triggerDetails: ResponderNodeConfigType;
}) => Promise<void>;

export type TriggerStartListenerPropsType<StartListenerConfig> = {
	userId: UserType['id'];
	workflowId: WorkflowType['id'];
	config: StartListenerConfig;
	triggerNodeId: NodeType['id'];
	triggerCallback: TriggerCallbackType;
	storeListener: (props: {
		triggerNodeId: NodeType['id'];
		triggerType: ResponderNodeConfigType['type'];
		uniqueKey: string;
		listener: any;
	}) => Promise<DefaultReturnType<true>>;
};

export type TriggerStartListenerDataPropsType<StartListenerConfig> = Omit<
	TriggerStartListenerPropsType<StartListenerConfig>,
	'triggerCallback' | 'storeListener'
>;

export type TriggerStartListenerValidateReturnType<StartListenerConfig> =
	TriggerStartListenerDataPropsType<StartListenerConfig>;

export type TriggerStopListenerPropsType<StopListenerConfig> = StopListenerConfig;

export type TriggerStopListenerValidateReturnType<StopListenerConfig> = StopListenerConfig;

// ========= Workflow Responder Node Types ========== //
export type ResponderMetadataType = Omit<MetadataType, 'category'> & {
	category: 'Responder';
};

export const responderDataFormats = ['string', 'json', 'array', 'object'] as const;
export type ResponderDataFormatType = (typeof responderDataFormats)[number];

export type ResponderNodePropsType<DataType extends { defaultData: any }, ConfigType> = GeneralNodePropsType<
	DataType,
	ConfigType
>;

export type ResponderNodeReturnType = GeneralNodeReturnType;

export type ResponderNodeConfigType =
	| InteractResponderConfigType
	| TelegramResponderConfigType
	| DiscordResponderConfigType
	| SlackResponderConfigType
	| CronDummyResponderConfigType
	| GoogleSheetsResponderConfigType
	| WhatsAppResponderConfigType
	| WebhookResponderConfigType;

export type ResponderNodeValidateReturnType<DataType, ConfigType> = GeneralNodeValidateReturnType<DataType, ConfigType>;

// ========= Workflow Tool Node Types ========== //
export type ToolMetadataType = Omit<MetadataType, 'category'> & {
	category: 'Tool';
};

export type ToolNodeValidatePropsType = Record<string, any>;

// ========= Workflow Node Config Types ========== //
export type NodeMetadataType = MetadataType | TriggerMetadataType | ResponderMetadataType | ToolMetadataType;

type BaseNodeConfigType = {
	name: string;
	label: string;
	description:
		| string
		| { text: string; url: string }
		| { text: string; url?: string; showWhen?: { field: string; value?: any; validValues?: string[] } }[];
	placeholder?: string;
	defaultValue?: any;
	showWhen?: { field: string; value: string };
	showButton?: { field: string; value: string; type: UserSsoConfigType['provider'] };
	validation: {
		field: string;
		label: string;
		type: 'string' | 'number' | 'array' | 'object' | 'boolean';
		required?: boolean;
		validValues?: string[];
		regex?: RegExp;
		isSensitiveData?: boolean;
		provider?: UserSsoConfigType['provider'];
	}[];
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

// ========= Workflow Node props Types ========== //
export type NodeAiGeneratePropsType = {
	[key: string]:
		| 'str'
		| 'int'
		| 'float'
		| 'bool'
		| 'list[str]'
		| 'list[int]'
		| 'list[float]'
		| 'list[bool]'
		| 'dict'
		| 'Any';
};
