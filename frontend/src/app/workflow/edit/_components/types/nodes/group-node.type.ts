import GroupNode from '../../modules/nodes/GroupNode';

export enum GroupNodeVariant {
	GROUP = 'group',
	PARENT = 'parent',
}

export const groupNodes = {
	[GroupNodeVariant.GROUP]: GroupNode,
};
