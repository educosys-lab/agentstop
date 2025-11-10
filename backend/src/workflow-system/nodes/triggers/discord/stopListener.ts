import { Client } from 'discord.js';

import { TriggerStopListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { DiscordStopListenerDataType, discordStopListenerValidate } from './validate';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const discordStopListener = async (
	data: TriggerStopListenerPropsType<DiscordStopListenerDataType>,
): Promise<DefaultReturnType<true>> => {
	try {
		const validate = await discordStopListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['discordStopListener - validate'],
			};
		}

		const { listener } = validate;

		const clientToDestroy: Client | undefined = listener as Client;

		if (!clientToDestroy || typeof clientToDestroy.destroy !== 'function') {
			if (!clientToDestroy)
				return {
					userMessage: 'No valid listener or active client found to stop!',
					error: 'No valid listener or active client found to stop!',
					errorType: 'InternalServerErrorException',
					errorData: { data },
					trace: [
						'discordStopListener - if (!clientToDestroy || typeof clientToDestroy.destroy !== "function")',
					],
				};
		}

		await clientToDestroy.destroy();

		return true;
	} catch (error) {
		return {
			userMessage: 'Failed to stop Discord listener!',
			error: 'Failed to stop Discord listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['discordStopListener - catch'],
		};
	}
};
