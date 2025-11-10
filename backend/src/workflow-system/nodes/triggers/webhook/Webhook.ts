import { Injectable } from '@nestjs/common';

import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { webhookTriggerMetadata } from './metadata';

@Injectable()
export default class WebhookNode extends TriggerBaseNode {
	metadata = webhookTriggerMetadata;
	config = [];
	startListener = async () => ({});
	startListenerValidate = async () => null as any;
	stopListener = async () => true as const;
	stopListenerValidate = async () => null as any;
}
