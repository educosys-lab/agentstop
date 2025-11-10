import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { discordSendExecute } from './execute';
import { DiscordSendConfigType, DiscordSendDataType } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';

export const discordSendTest = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<DiscordSendDataType, DiscordSendConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	return await discordSendExecute({ format, data, config });
};
