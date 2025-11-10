import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { openAiConfig } from './config';
import { openAiExecute } from './execute';
import { openAiTest } from './test';
import { openAiValidate } from './validate';
import { openAiMetadata } from './metadata';

@Injectable()
export default class OpenaiNode extends GeneralBaseNode {
	metadata = openAiMetadata;
	config = openAiConfig;
	execute = openAiExecute;
	validate = openAiValidate;
	terminate = async () => true as const;
	test = openAiTest;
}
