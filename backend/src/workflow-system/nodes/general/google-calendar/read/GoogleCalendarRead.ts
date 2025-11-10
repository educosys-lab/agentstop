import { Injectable } from '@nestjs/common';

import { googleCalendarReadMetadata } from './metadata';
import { googleCalendarReadTest } from './test';
import { googleCalendarReadConfig } from './config';
import { googleCalendarReadValidate } from './validate';
import { googleCalendarReadExecute } from './execute';
import GeneralBaseNode from 'src/workflow-system/nodes/base-node/general/GeneralBaseNode';

@Injectable()
export default class GoogleCalendarRead extends GeneralBaseNode {
	metadata = googleCalendarReadMetadata;
	config = googleCalendarReadConfig;
	execute = googleCalendarReadExecute;
	validate = googleCalendarReadValidate;
	terminate = async () => true as const;
	test = googleCalendarReadTest;
}
