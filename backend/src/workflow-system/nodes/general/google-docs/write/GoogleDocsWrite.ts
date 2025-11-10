import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { googleDocsWriteConfig } from './config';
import { googleDocsWriteExecute } from './execute';
import { googleDocsWriteTest } from './test';
import { googleDocsWriteValidate } from './validate';
import { googleDocsWriteMetadata } from './metadata';

@Injectable()
export default class GoogleDocsWriteNode extends GeneralBaseNode {
	metadata = googleDocsWriteMetadata;
	config = googleDocsWriteConfig;
	execute = googleDocsWriteExecute;
	validate = googleDocsWriteValidate;
	terminate = async () => true as const;
	test = googleDocsWriteTest;
}
