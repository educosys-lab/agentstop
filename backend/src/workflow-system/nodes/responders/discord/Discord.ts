import { Injectable } from '@nestjs/common';

import { discordResponderExecute } from './execute';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';
import { discordResponderMetadata } from './metadata';
import { discordResponderValidate } from './validate';

@Injectable()
export default class DiscordResponderNode extends ResponderBaseNode {
	metadata = discordResponderMetadata;
	validate = discordResponderValidate;
	execute = discordResponderExecute;
}
