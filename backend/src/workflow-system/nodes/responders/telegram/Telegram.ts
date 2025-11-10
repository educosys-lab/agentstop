import { Injectable } from '@nestjs/common';

import { telegramResponderExecute } from './execute';
import { telegramResponderValidate } from './validate';
import { telegramResponderMetadata } from './metadata';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';

@Injectable()
export default class TelegramResponderNode extends ResponderBaseNode {
	metadata = telegramResponderMetadata;
	validate = telegramResponderValidate;
	execute = telegramResponderExecute;
}
