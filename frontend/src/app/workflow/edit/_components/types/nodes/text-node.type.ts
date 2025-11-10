import RichText from '../../modules/nodes/RichText';

export enum TextNodeVariant {
	RICH_TEXT = 'rich-text',
}

export const textNodes = {
	[TextNodeVariant.RICH_TEXT]: RichText,
};
