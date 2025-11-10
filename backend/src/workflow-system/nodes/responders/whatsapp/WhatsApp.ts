import { Injectable } from '@nestjs/common';

import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';
import { whatsappResponderExecute } from './execute';
import { whatsappResponderMetadata } from './metadata';
import { whatsappResponderValidate } from './validate';

@Injectable()
export default class WhatsAppResponderNode extends ResponderBaseNode {
	metadata = whatsappResponderMetadata;
	validate = whatsappResponderValidate;
	execute = whatsappResponderExecute;
}
