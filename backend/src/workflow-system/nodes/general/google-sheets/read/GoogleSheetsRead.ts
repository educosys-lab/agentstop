import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../../base-node/general/GeneralBaseNode';
import { googleSheetsReadConfig } from './config';
import { googleSheetsReadMetadata } from './metadata';
import { googleSheetsReadExecute } from './execute';
import { googleSheetsReadTest } from './test';
import { googleSheetsReadValidate } from './validate';

@Injectable()
export default class GoogleSheetsRead extends GeneralBaseNode {
	metadata = googleSheetsReadMetadata;
	config = googleSheetsReadConfig;
	execute = googleSheetsReadExecute;
	validate = googleSheetsReadValidate;
	terminate = async () => true as const;
	test = googleSheetsReadTest;
}
