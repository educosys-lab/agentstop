import { DefaultReturnType } from 'src/shared/types/return.type';
import {
	TriggerMetadataType,
	TriggerStartListenerPropsType,
	NodeConfigType,
	TriggerStartListenerValidateReturnType,
	TriggerStopListenerPropsType,
	TriggerStopListenerValidateReturnType,
	TriggerStartListenerDataPropsType,
} from 'src/workflow-system/workflow-system.type';

// Trigger Base Node
export default abstract class TriggerBaseNode<StartListenerConfig = any, StopListenerConfig = any> {
	// Node metadata
	abstract metadata: TriggerMetadataType;

	// Node configuration
	abstract config: NodeConfigType[];

	// Start listener
	abstract startListener({
		userId,
		workflowId,
		triggerNodeId,
		config,
		triggerCallback,
		storeListener,
	}: TriggerStartListenerPropsType<StartListenerConfig>): Promise<DefaultReturnType<Record<string, any>>>;

	// Validate
	abstract startListenerValidate(
		data: TriggerStartListenerDataPropsType<StartListenerConfig>,
	): Promise<DefaultReturnType<TriggerStartListenerValidateReturnType<StartListenerConfig>>>;

	// Stop listener
	abstract stopListener(data: TriggerStopListenerPropsType<StopListenerConfig>): Promise<DefaultReturnType<true>>;

	// Validate
	abstract stopListenerValidate(
		data: TriggerStopListenerPropsType<StopListenerConfig>,
	): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<StopListenerConfig>>>;
}
