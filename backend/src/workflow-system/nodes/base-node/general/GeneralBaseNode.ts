import { DefaultReturnType } from 'src/shared/types/return.type';
import {
	MetadataType,
	NodeConfigType,
	GeneralNodePropsType,
	GeneralNodeReturnType,
	NodeAiGeneratePropsType,
	GeneralNodeValidateReturnType,
} from 'src/workflow-system/workflow-system.type';

// General Base Node
export default abstract class GeneralBaseNode<
	DataType extends { defaultData: any } = { defaultData: any },
	ConfigType = any,
> {
	// Node metadata
	abstract metadata: MetadataType;

	// Node configuration
	abstract config: NodeConfigType[];

	// Node extra props
	aiGenerateProps: NodeAiGeneratePropsType;

	// Node AI prompt
	aiPrompt: string;

	// Execute
	abstract execute({
		format,
		data,
		config,
	}: GeneralNodePropsType<DataType, ConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>>;

	// Validate
	abstract validate({
		format,
		data,
		config,
	}: GeneralNodePropsType<DataType, ConfigType>): Promise<
		DefaultReturnType<GeneralNodeValidateReturnType<DataType, ConfigType>>
	>;

	// Terminate
	abstract terminate(): Promise<DefaultReturnType<true>>;

	// Testing
	abstract test({
		data,
		config,
	}: GeneralNodePropsType<DataType, ConfigType>): Promise<DefaultReturnType<GeneralNodeReturnType>>;
}
