import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { httpMetadata } from './metadata';
import { httpConfig } from './config';
import { httpExecute } from './execute';
import { httpTest } from './test';
import { httpValidate } from './validate';

@Injectable()
export default class Http extends GeneralBaseNode {
	metadata = httpMetadata;
	config = httpConfig;
	execute = httpExecute;
	validate = httpValidate;
	terminate = async () => true as const;
	test = httpTest;
}
