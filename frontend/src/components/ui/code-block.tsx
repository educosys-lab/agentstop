import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ButtonElement } from '../elements/ButtonElement';

type CodeBlockPropsType = {
	code: string;
	language?: string;
};

export default function CodeBlock({ code, language = 'text' }: CodeBlockPropsType) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy code:', err);
		}
	};

	return (
		<div className="relative my-4 rounded-lg border border-gray-700 bg-[#1e1e1e]">
			<ButtonElement
				onClick={handleCopy}
				variant={'wrapper'}
				title="Copy code"
				className="absolute right-2 top-2 rounded bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-800"
			>
				{copied ? 'Copied!' : 'Copy'}
			</ButtonElement>

			<SyntaxHighlighter
				language={language}
				style={oneDark}
				customStyle={{ margin: 0, padding: '1.25rem', fontSize: '0.875rem' }}
			>
				{code}
			</SyntaxHighlighter>
		</div>
	);
}
