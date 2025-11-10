'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import { FontSize } from './FontSize';
import Paragraph from '@tiptap/extension-paragraph';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Color } from '@tiptap/extension-color';
import History from '@tiptap/extension-history';

import './TextEditor.css';

import { cn, rgbToHex } from '@/utils/theme.util';

type TextEditorPropsType = {
	content?: string;
	onFocus?: () => void;
	onBlur?: () => void;
	onUpdateFontSize?: (fontSize: number) => void;
	onUpdateTextColor?: (color: string) => void;
	onUpdateContent?: (content: string) => void;
	isSelected?: boolean;
	className?: string;
};

export const TextEditor = forwardRef<{ editor: Editor | null } | null, TextEditorPropsType>(
	(
		{ content = '', onFocus, onBlur, onUpdateFontSize, onUpdateTextColor, onUpdateContent, isSelected, className },
		ref,
	) => {
		const [isEditorOnFocus, setIsEditorOnFocus] = useState(false);

		useImperativeHandle(ref, () => ({
			editor,
		}));

		const editor = useEditor({
			extensions: [
				Document,
				Placeholder.configure({ placeholder: 'Double click to edit' }),
				Text,
				TextStyle,
				FontSize,
				Paragraph,
				Bold,
				Italic,
				Strike,
				Underline,
				HorizontalRule,
				Color,
				History,
			],
			content,
			onFocus: () => {
				setIsEditorOnFocus(true);
				if (onFocus) onFocus();
			},
			onBlur: () => {
				if (onBlur) onBlur();
				setIsEditorOnFocus(false);
			},
			onSelectionUpdate: ({ editor }) => {
				const fontSize = editor.getAttributes('textStyle').fontSize;
				const color = editor.getAttributes('textStyle').color;

				if (onUpdateFontSize) {
					if (!fontSize) onUpdateFontSize(16);
					else onUpdateFontSize(Number(fontSize.replace('px', '')));
				}

				if (onUpdateTextColor) {
					if (!color) onUpdateTextColor('#FFFFFF');
					else if (color.includes('rgb')) onUpdateTextColor(rgbToHex(color));
					else onUpdateTextColor(color);
				}
			},
			onUpdate: ({ editor }) => {
				if (onUpdateContent) onUpdateContent(editor.getHTML());
			},
			immediatelyRender: false,
		});

		useEffect(() => {
			if (isSelected) return;
			if (window.getSelection()?.empty) window.getSelection()?.empty();
			if (window.getSelection()?.removeAllRanges) window.getSelection()?.removeAllRanges();
		}, [isSelected]);

		return (
			<EditorContent
				editor={editor}
				spellCheck={false}
				className={cn(
					'relative size-full overflow-auto border px-1 py-0.5',
					isSelected && 'nodrag cursor-text',
					!isSelected && 'pointer-events-none',
					isEditorOnFocus && 'z-10',
					className,
				)}
			/>
		);
	},
);

TextEditor.displayName = 'TextEditor';
