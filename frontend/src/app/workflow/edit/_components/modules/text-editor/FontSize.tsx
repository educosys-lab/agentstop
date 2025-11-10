import { Extension } from '@tiptap/react';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		fontSize: {
			setFontSize: (size: number) => ReturnType;
			unsetFontSize: () => ReturnType;
		};
	}
}

export const FontSize = Extension.create({
	name: 'fontSize',
	addOptions() {
		return { types: ['textStyle'] };
	},
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null,
						parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ''),
						renderHTML: (attributes) => {
							if (!attributes.fontSize) return {};
							return { style: `font-size: ${attributes.fontSize}` };
						},
					},
				},
			},
		];
	},
	addCommands(): any {
		return {
			setFontSize:
				(fontSize: number) =>
				({ chain }: any) => {
					return chain()
						.setMark('textStyle', { fontSize: fontSize + 'px' })
						.run();
				},
			unsetFontSize:
				() =>
				({ chain }: any) => {
					return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
				},
		};
	},
});
