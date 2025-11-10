import { Injectable } from '@nestjs/common';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';
import { slackResponderMetadata } from './metadata';
import { slackResponderValidate } from './validate';
import { slackResponderExecute } from './execute';

@Injectable()
export default class SlackResponderNode extends ResponderBaseNode {
	metadata = slackResponderMetadata;
	validate = slackResponderValidate;
	execute = slackResponderExecute;
}
