import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { discordReadExecute } from './execute';
import { DiscordReadConfigType, DiscordReadDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const discordReadTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordReadDataType, DiscordReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await discordReadExecute({ format, data, config });
};
