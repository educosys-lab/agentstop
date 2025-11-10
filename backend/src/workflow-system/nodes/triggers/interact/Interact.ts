import { Injectable } from '@nestjs/common';

import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { interactTriggerMetadata } from './metadata';

@Injectable()
export default class InteractNode extends TriggerBaseNode {
	metadata = interactTriggerMetadata;
	config = [];
	startListener = async () => ({});
	startListenerValidate = async () => null as any;
	stopListener = async () => true as const;
	stopListenerValidate = async () => null as any;
}
