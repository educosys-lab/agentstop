import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { googleDocsReadMetadata } from './metadata';
import { googleDocsReadTest } from './test';
import { googleDocsReadConfig } from './config';
import { googleDocsReadValidate } from './validate';
import { googleDocsReadExecute } from './execute';

@Injectable()
export default class GoogleDocsRead extends GeneralBaseNode {
	metadata = googleDocsReadMetadata;
	config = googleDocsReadConfig;
	execute = googleDocsReadExecute;
	validate = googleDocsReadValidate;
	terminate = async () => true as const;
	test = googleDocsReadTest;
}
