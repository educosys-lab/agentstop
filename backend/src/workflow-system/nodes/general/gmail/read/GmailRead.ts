import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { gmailReadConfig } from './config';
import { gmailReadExecute } from './execute';
import { gmailReadTest } from './test';
import { gmailReadValidate } from './validate';
import { gmailReadMetadata } from './metadata';

@Injectable()
export default class GmailRead extends GeneralBaseNode {
	metadata = gmailReadMetadata;
	config = gmailReadConfig;
	execute = gmailReadExecute;
	validate = gmailReadValidate;
	terminate = async () => true as const;
	test = gmailReadTest;
}
