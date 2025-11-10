import { Injectable } from '@nestjs/common';

import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { telegramTriggerConfig } from './config';
import { telegramStartListener } from './startListener';
import { telegramStartListenerValidate } from './validate';
import { telegramTriggerMetadata } from './metadata';

@Injectable()
export default class TelegramTriggerNode extends TriggerBaseNode {
	metadata = telegramTriggerMetadata;
	config = telegramTriggerConfig;
	startListener = telegramStartListener;
	startListenerValidate = telegramStartListenerValidate;
	stopListener = async () => true as const;
	stopListenerValidate = async () => ({ status: 'success' as const, data: null });
}
