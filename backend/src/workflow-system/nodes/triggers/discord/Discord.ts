import { Injectable } from '@nestjs/common';
import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { discordTriggerConfig } from './config';
import { discordStartListener } from './startListener';
import { discordStopListener } from './stopListener';
import { discordStartListenerValidate, discordStopListenerValidate } from './validate';
import { discordTriggerMetadata } from './metadata';

export type DiscordResponderType = { nodeId: string; type: 'discord'; channel_id: string; bot_token: string };

@Injectable()
export default class DiscordTriggerNode extends TriggerBaseNode {
	metadata = discordTriggerMetadata;
	config = discordTriggerConfig;
	startListener = discordStartListener;
	startListenerValidate = discordStartListenerValidate;
	stopListener = discordStopListener;
	stopListenerValidate = discordStopListenerValidate;
}
