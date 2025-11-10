import { DefaultReturnType } from 'src/shared/types/return.type';
import { NodeConfigType, ToolMetadataType, ToolNodeValidatePropsType } from 'src/workflow-system/workflow-system.type';

// General Base Node
export default abstract class ToolBaseNode {
	// Node metadata
	abstract metadata: ToolMetadataType;

	// Node configuration
	abstract config: NodeConfigType[];

	// Validate
	abstract validate(config: ToolNodeValidatePropsType): Promise<DefaultReturnType<true>>;
}
