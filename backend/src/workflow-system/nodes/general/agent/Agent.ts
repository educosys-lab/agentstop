import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { agentConfig } from './config';
import { agentExecute } from './execute';
import { agentMetadata } from './metadata';
import { agentTest } from './test';
import { agentValidate } from './validate';

@Injectable()
export default class AgentNode extends GeneralBaseNode {
	metadata = agentMetadata;
	config = agentConfig;
	execute = agentExecute;
	validate = agentValidate;
	terminate = async () => true as const;
	test = agentTest;
}
