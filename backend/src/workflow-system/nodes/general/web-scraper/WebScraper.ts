import { Injectable } from '@nestjs/common';

import GeneralBaseNode from '../../base-node/general/GeneralBaseNode';
import { webScraperMetadata } from './metadata';
import { webScraperTest } from './test';
import { webScraperConfig } from './config';
import { webScraperValidate } from './validate';
import { webScraperExecute } from './execute';

@Injectable()
export default class WebScraper extends GeneralBaseNode {
	metadata = webScraperMetadata;
	config = webScraperConfig;
	execute = webScraperExecute;
	validate = webScraperValidate;
	terminate = async () => true as const;
	test = webScraperTest;
}
