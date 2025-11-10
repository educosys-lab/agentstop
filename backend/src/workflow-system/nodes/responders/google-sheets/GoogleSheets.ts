import { Injectable } from '@nestjs/common';
import ResponderBaseNode from '../../base-node/responder/ResponderBaseNode';
import { googleSheetsResponderExecute } from './execute';
import { googleSheetsResponderMetadata } from './metadata';
import { googleSheetsResponderValidate } from './validate';

@Injectable()
export default class GoogleSheetsResponderNode extends ResponderBaseNode {
	metadata = googleSheetsResponderMetadata;
	validate = googleSheetsResponderValidate;
	execute = googleSheetsResponderExecute;
}
