import { Injectable } from '@nestjs/common';

import { defaultResponderExecute } from './execute';
import { defaultResponderMetadata } from './metadata';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';

@Injectable()
export default class DefaultResponderNode extends ResponderBaseNode {
	metadata = defaultResponderMetadata;
	config = [];
	execute = defaultResponderExecute;
	validate = async () => ({
		status: 'success' as const,
		format: 'string' as const,
		data: { defaultData: '' },
		config: {},
	});
}
