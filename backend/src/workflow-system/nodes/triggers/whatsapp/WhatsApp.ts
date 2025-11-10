import { Injectable } from '@nestjs/common';
import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { whatsappTriggerConfig } from './config';
import { whatsappStartListener } from './startListener';
import { whatsappStopListener } from './stopListener';
import { whatsappStartListenerValidate, whatsappStopListenerValidate } from './validate';
import { whatsappTriggerMetadata } from './metadata';

export type WhatsAppResponderType = {
	nodeId: string;
	type: 'whatsapp';
	access_token: string;
	phone_number_id: string;
	verify_token: string;
	webhook_url: string;
};

@Injectable()
export default class WhatsAppTriggerNode extends TriggerBaseNode {
	metadata = whatsappTriggerMetadata;
	config = whatsappTriggerConfig;
	startListener = whatsappStartListener;
	startListenerValidate = whatsappStartListenerValidate;
	stopListener = whatsappStopListener;
	stopListenerValidate = whatsappStopListenerValidate;
}
