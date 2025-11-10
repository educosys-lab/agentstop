import { Injectable } from '@nestjs/common';
import TriggerBaseNode from '../../base-node/trigger/TriggerBaseNode';
import { googleSheetsTriggerConfig } from './config';
import { googleSheetsStartListener } from './startListener';
import { googleSheetsStopListener } from './stopListener';
import { googleSheetsStartListenerValidate, googleSheetsStopListenerValidate } from './validate';
import { googleSheetsTriggerMetadata } from './metadata';

@Injectable()
export default class GoogleSheetsTriggerNode extends TriggerBaseNode {
	metadata = googleSheetsTriggerMetadata;
	config = googleSheetsTriggerConfig;
	startListener = googleSheetsStartListener;
	startListenerValidate = googleSheetsStartListenerValidate;
	stopListener = googleSheetsStopListener;
	stopListenerValidate = googleSheetsStopListenerValidate;
}
