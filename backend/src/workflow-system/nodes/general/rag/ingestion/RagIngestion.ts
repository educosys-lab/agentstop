import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { ragIngestionConfig } from './config';
import { ragIngestionExecute } from './execute';
import { ragIngestionTest } from './test';
import { ragIngestionValidate } from './validate';
import { ragIngestionMetadata } from './metadata';

@Injectable()
export default class RagIngestionNode extends GeneralBaseNode {
	metadata = ragIngestionMetadata;
	config = ragIngestionConfig;
	execute = ragIngestionExecute;
	validate = ragIngestionValidate;
	terminate = async () => true as const;
	test = ragIngestionTest;
}
