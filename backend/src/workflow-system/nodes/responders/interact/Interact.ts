import { Injectable } from '@nestjs/common';

import { interactResponderExecute } from './execute';
import { interactResponderValidate } from './validate';
import { interactResponderMetadata } from './metadata';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';

@Injectable()
export default class InteractResponderNode extends ResponderBaseNode {
	metadata = interactResponderMetadata;
	validate = interactResponderValidate;
	execute = interactResponderExecute;
}
