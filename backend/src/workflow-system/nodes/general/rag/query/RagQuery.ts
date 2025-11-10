import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { ragQueryExecute } from './execute';
import { ragQueryTest } from './test';
import { ragQueryValidate } from './validate';
import { ragQueryMetadata } from './metadata';
import { ragQueryConfig } from './config';

@Injectable()
export default class RagQueryNode extends GeneralBaseNode {
	metadata = ragQueryMetadata;
	config = ragQueryConfig;
	execute = ragQueryExecute;
	validate = ragQueryValidate;
	terminate = async () => true as const;
	test = ragQueryTest;
}
