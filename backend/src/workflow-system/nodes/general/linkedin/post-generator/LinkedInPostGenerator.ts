import { Injectable } from '@nestjs/common';

import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';
import { linkedInPostConfig } from './config';
import { linkedInPostExecute } from './execute';
import { linkedInPostMetadata } from './metadata';
import { linkedInPostTest } from './test';
import { linkedInPostValidate } from './validate';

@Injectable()
export default class LinkedInPostNode extends GeneralBaseNode {
	metadata = linkedInPostMetadata;
	config = linkedInPostConfig;
	execute = linkedInPostExecute;
	validate = linkedInPostValidate;
	terminate = async () => true as const;
	test = linkedInPostTest;
}
