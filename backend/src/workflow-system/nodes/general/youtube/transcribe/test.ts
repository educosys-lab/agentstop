import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { youTubeTranscribeExecute } from './execute';
import { YouTubeTranscribeDataType, YouTubeTranscribeConfigType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const youTubeTranscribeTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<YouTubeTranscribeDataType, YouTubeTranscribeConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await youTubeTranscribeExecute({ format, data, config });
};
