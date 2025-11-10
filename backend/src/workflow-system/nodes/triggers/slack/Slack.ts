import { Injectable } from '@nestjs/common';
import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { slackTriggerConfig } from './config';
import { slackStartListener } from './startListener';
import { slackStopListener } from './stopListener';
import { slackStartListenerValidate, slackStopListenerValidate } from './validate';
import { slackTriggerMetadata } from './metadata';

export type SlackResponderType = { nodeId: string; type: 'slack'; channel_id: string; bot_token: string };

@Injectable()
export default class SlackTriggerNode extends TriggerBaseNode {
	metadata = slackTriggerMetadata;
	config = slackTriggerConfig;
	startListener = slackStartListener;
	startListenerValidate = slackStartListenerValidate;
	stopListener = slackStopListener;
	stopListenerValidate = slackStopListenerValidate;
}
