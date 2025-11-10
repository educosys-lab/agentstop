import { Injectable } from '@nestjs/common';
import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { cronTriggerConfig } from './config';
import { cronStartListener } from './startListener';
import { cronStopListener } from './stopListener';
import { cronStartListenerValidate, cronStopListenerValidate } from './validate';
import { cronTriggerMetadata } from './metadata';

@Injectable()
export default class CronTriggerNode extends TriggerBaseNode {
	metadata = cronTriggerMetadata;
	config = cronTriggerConfig;
	startListener = cronStartListener;
	startListenerValidate = cronStartListenerValidate;
	stopListener = cronStopListener;
	stopListenerValidate = cronStopListenerValidate;
}

export type CronDummyResponderConfigType = { type: 'cron'; nodeId: string };
