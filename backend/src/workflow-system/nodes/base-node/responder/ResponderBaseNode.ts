import { DefaultReturnType } from 'src/shared/types/return.type';
import {
	ResponderNodePropsType,
	ResponderMetadataType,
	ResponderNodeReturnType,
	ResponderNodeValidateReturnType,
} from 'src/workflow-system/workflow-system.type';

// Responder Base Node
export default abstract class ResponderBaseNode<
	DataType extends { defaultData: any } = { defaultData: any },
	ConfigType = any,
> {
	// Node metadata
	abstract metadata: ResponderMetadataType;

	// Send response
	abstract execute({
		format,
		data,
		config,
	}: ResponderNodePropsType<DataType, ConfigType>): Promise<DefaultReturnType<ResponderNodeReturnType>>;

	// Validate
	abstract validate({
		format,
		data,
		config,
	}: ResponderNodePropsType<DataType, ConfigType>): Promise<
		DefaultReturnType<ResponderNodeValidateReturnType<DataType, ConfigType>>
	>;
}
