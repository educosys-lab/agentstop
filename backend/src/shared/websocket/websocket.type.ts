import { AddInteractMessageType } from 'src/interact/interact.type';

export type HandleInteractType = {
	action: 'sendInteractMessage';
	data: Omit<AddInteractMessageType, 'isInternal'>;
};
