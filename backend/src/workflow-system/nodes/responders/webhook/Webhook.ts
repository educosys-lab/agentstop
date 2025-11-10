import { Injectable } from '@nestjs/common';

import { webhookResponderExecute } from './execute';
import { webhookResponderValidate } from './validate';
import { webhookResponderMetadata } from './metadata';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';

@Injectable()
export default class WebhookResponderNode extends ResponderBaseNode {
	metadata = webhookResponderMetadata;
	validate = webhookResponderValidate;
	execute = webhookResponderExecute;
}
