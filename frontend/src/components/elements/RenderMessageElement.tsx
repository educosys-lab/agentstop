import { Fragment, isValidElement, ReactNode } from 'react';

import CodeBlock from '../ui/code-block';
import { Download } from 'lucide-react';

type MessagePartType = {
	type: 'text' | 'code';
	content: string;
	language?: string;
};

const splitContent = (content: string): MessagePartType[] => {
	const regex = /```(\w+)?\n([\s\S]*?)```/g;
	const result: MessagePartType[] = [];

	let lastIndex = 0;
	let match;

	while ((match = regex.exec(content)) !== null) {
		if (match.index > lastIndex) {
			result.push({ type: 'text', content: content.slice(lastIndex, match.index) });
		}
		result.push({
			type: 'code',
			language: match[1] || 'plaintext',
			content: match[2],
		});
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < content.length) {
		result.push({ type: 'text', content: content.slice(lastIndex) });
	}

	return result;
};

export const unescapeMessageContent = (content: string): string => {
	let unescaped = content;

	try {
		for (let i = 0; i < 2; i++) {
			if (unescaped.includes('\\n') || unescaped.includes('\\"') || unescaped.includes('\\\\')) {
				unescaped = JSON.parse(`"${unescaped.replace(/"/g, '\\"')}"`);
			} else {
				break;
			}
		}
	} catch (e) {
		unescaped = unescaped.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		console.warn('Partial fallback unescape used:', e);
	}

	return unescaped;
};

const formatInlineText = (line: string): ReactNode[] => {
	const processedUrls = new Set<string>();
	const processedImages = new Set<string>();
	const urlRegex = /(https?:\/\/[^\s<>"']+[^\s<>"'.,!?])/g;
	const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s<>"']+[^\s<>"'.,!?])\)/g;
	const imageRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s<>"']+[^\s<>"'.,!?])\)/g;
	const lines = line.split('\n').filter((l) => l.trim() !== '');
	const segments: ReactNode[] = [];

	lines.forEach((lineSegment, lineIndex) => {
		const lineSegments: string[] = [];
		let lastIndex = 0;
		let match;

		while ((match = imageRegex.exec(lineSegment)) !== null) {
			if (match.index > lastIndex) {
				lineSegments.push(lineSegment.slice(lastIndex, match.index));
			}
			const url = match[2];
			if (!processedImages.has(url)) {
				processedImages.add(url);
				if (processedImages.size === 1) {
					lineSegments.push(url);
				}
			}
			lastIndex = imageRegex.lastIndex;
		}

		let lastLinkIndex = lastIndex;
		while ((match = linkRegex.exec(lineSegment)) !== null) {
			if (match.index > lastLinkIndex) {
				lineSegments.push(lineSegment.slice(lastLinkIndex, match.index));
			}
			const url = match[2];
			if (!processedUrls.has(url)) {
				processedUrls.add(url);
				lineSegments.push(url);
			}
			lastLinkIndex = linkRegex.lastIndex;
		}
		if (lastLinkIndex < lineSegment.length) {
			const remaining = lineSegment.slice(lastLinkIndex);
			let urlMatch;
			let lastUrlIndex = 0;
			while ((urlMatch = urlRegex.exec(remaining)) !== null) {
				if (urlMatch.index > lastUrlIndex) {
					lineSegments.push(remaining.slice(lastUrlIndex, urlMatch.index));
				}
				const url = urlMatch[0];
				if (!processedUrls.has(url)) {
					processedUrls.add(url);
					lineSegments.push(url);
				}
				lastUrlIndex = urlRegex.lastIndex;
			}
			if (lastUrlIndex < remaining.length) {
				lineSegments.push(remaining.slice(lastUrlIndex));
			}
		}

		const renderedSegments = lineSegments
			.filter((segment) => segment.trim() !== '' && segment.trim() !== '.')
			.map((segment, i) => {
				if (/^https?:\/\/[^\s<>"']+[^\s<>"'.,!?]$/.test(segment)) {
					if (segment.includes('quickchart.io/chart?c=') && processedImages.size === 0) {
						const handleDownload = async () => {
							try {
								const response = await fetch(segment);
								if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
								const blob = await response.blob();
								const url = URL.createObjectURL(blob);
								const img = new Image();
								img.crossOrigin = 'anonymous';
								img.src = url;

								img.onload = () => {
									const canvas = document.createElement('canvas');
									canvas.width = img.width;
									canvas.height = img.height;
									const ctx = canvas.getContext('2d');

									if (ctx) {
										ctx.fillStyle = 'white';
										ctx.fillRect(0, 0, canvas.width, canvas.height);
										ctx.drawImage(img, 0, 0);
										canvas.toBlob((newBlob) => {
											if (newBlob) {
												const newUrl = URL.createObjectURL(newBlob);
												const link = document.createElement('a');
												link.href = newUrl;
												link.download = `chart_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
												document.body.appendChild(link);
												link.click();
												document.body.removeChild(link);
												URL.revokeObjectURL(newUrl);
											}
										}, 'image/png');
									}
									URL.revokeObjectURL(url);
								};
							} catch (error) {
								console.error('Download failed:', error);
							}
						};

						processedImages.add(segment);
						return (
							<div key={`${lineIndex}-${i}`} className="my-2 flex w-full flex-col items-start">
								<div className="w-full max-w-[500px] rounded-lg bg-white p-2">
									<img src={segment} alt="Chart" className="h-auto w-full object-contain" />
								</div>
								<div className="pt-3">
									<Download
										onClick={handleDownload}
										className="size-6 cursor-pointer hover:text-blue-500"
									/>
								</div>
							</div>
						);
					}
					// Render non-quickchart URLs as plain text
					return (
						<a
							key={`${lineIndex}-${i}`}
							href={segment}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-400 hover:text-blue-500 underline"
						>
							{segment}
						</a>
					);
				}
				if (/^data:image\/[a-zA-Z]+;base64,[^\s<>"']+$/.test(segment) && processedImages.size === 0) {
					processedImages.add(segment);
					return (
						<img
							key={`${lineIndex}-${i}`}
							src={segment}
							alt="Chart"
							className="my-2 h-auto max-w-full rounded-lg"
							style={{ maxWidth: '500px', backgroundColor: 'white', padding: '10px' }}
						/>
					);
				}
				if (/\*\*([^*]+)\*\*/.test(segment)) {
					return segment.split(/(\*\*[^**]+\*\*)/).map((part, j) => {
						if (/\*\*[^**]+\*\*/.test(part)) {
							return <strong key={`${lineIndex}-${i}-${j}`}>{part.replace(/\*\*/g, '')}</strong>;
						}
						return <Fragment key={`${lineIndex}-${i}-${j}`}>{part}</Fragment>;
					});
				}
				if (/~~([^~]+)~~/.test(segment)) {
					return segment.split(/(~~[^~]+~~)/).map((part, j) => {
						if (/~~[^~]+~~/.test(part)) {
							return <del key={`${lineIndex}-${i}-${j}`}>{part.replace(/~~/g, '')}</del>;
						}
						return <Fragment key={`${lineIndex}-${i}-${j}`}>{part}</Fragment>;
					});
				}
				if (/^`[^`]+`$/.test(segment)) {
					return (
						<code
							key={`${lineIndex}-${i}`}
							className="rounded bg-gray-700/80 px-1 py-0.5 font-mono text-sm text-green-500/90"
						>
							{segment.slice(1, -1)}
						</code>
					);
				}
				return <Fragment key={`${lineIndex}-${i}`}>{segment}</Fragment>;
			})
			.filter(Boolean);

		segments.push(
			<p key={`line-${lineIndex}`} className="break-words text-white">
				{renderedSegments}
			</p>,
		);
	});

	return segments;
};

const renderMarkdownTable = (lines: string[], startIndex: number): { table: ReactNode; nextIndex: number } => {
	const headerLine = lines[startIndex];
	const dividerLine = lines[startIndex + 1];

	if (!/^(\|\s*.+\s*)+\|$/.test(headerLine) || !/^(\|\s*-+\s*)+\|$/.test(dividerLine)) {
		return { table: null, nextIndex: startIndex };
	}

	const headers = headerLine
		.split('|')
		.slice(1, -1)
		.map((h) => h.trim());
	const rows: string[][] = [];

	let currentIndex = startIndex + 2;
	while (currentIndex < lines.length && /^\|(.+)\|$/.test(lines[currentIndex])) {
		const row = lines[currentIndex]
			.split('|')
			.slice(1, -1)
			.map((cell) => cell.trim());
		rows.push(row);
		currentIndex++;
	}

	return {
		table: (
			<table className="mb-4 w-full table-auto border border-gray-700 text-sm text-white">
				<thead className="bg-gray-800">
					<tr>
						{headers.map((header, idx) => (
							<th key={idx} className="border border-gray-600 px-2 py-1 font-semibold">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr key={rowIndex} className="even:bg-gray-900">
							{row.map((cell, cellIndex) => (
								<td key={cellIndex} className="border border-gray-600 px-2 py-1">
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		),
		nextIndex: currentIndex,
	};
};

const renderFormattedText = (text: string) => {
	const lines = text.split('\n');
	const elements: ReactNode[] = [];

	let i = 0;
	while (i < lines.length) {
		if (i + 1 < lines.length && /^\|(.+)\|$/.test(lines[i]) && /^\|(\s*-+\s*\|)+$/.test(lines[i + 1])) {
			const { table, nextIndex } = renderMarkdownTable(lines, i);
			if (table) {
				elements.push(<Fragment key={`table-${i}`}>{table}</Fragment>);
				i = nextIndex;
				continue;
			}
		}

		if (lines[i].startsWith('###')) {
			elements.push(
				<h3 key={i} className="mb-1 mt-2 text-lg font-semibold">
					{lines[i].replace(/^###\s*/, '')}
				</h3>,
			);
		} else if (lines[i].startsWith('##')) {
			elements.push(
				<h2 key={i} className="mb-2 mt-3 text-xl font-bold">
					{lines[i].replace(/^##\s*/, '')}
				</h2>,
			);
		} else if (lines[i].startsWith('#')) {
			elements.push(
				<h1 key={i} className="mb-2 mt-4 text-2xl font-extrabold">
					{lines[i].replace(/^#\s*/, '')}
				</h1>,
			);
		} else if (/^\s*[-*]\s+/.test(lines[i])) {
			const content = lines[i].replace(/^\s*[-*]\s+/, '');
			elements.push(
				<li key={i} className="ml-4 list-disc text-white">
					{formatInlineText(content)}
				</li>,
			);
		} else if (/^\*\*[^\*]+\*\*$/.test(lines[i].trim())) {
			elements.push(
				<p key={i} className="mt-2 font-semibold text-white">
					{lines[i].trim().slice(2, -2)}
				</p>,
			);
		} else {
			elements.push(
				<p key={i} className="text-white">
					{formatInlineText(lines[i])}
				</p>,
			);
		}
		i++;
	}

	return elements;
};

export const RenderMessageElement = ({ content }: { content: string }) => {
	const parts = splitContent(unescapeMessageContent(content));

	return (
		<div className="space-y-2 whitespace-pre-wrap text-white">
			{parts.map((part, idx) => {
				if (part.type === 'code') {
					return <CodeBlock key={idx} code={part.content.trim()} language={part.language || 'plaintext'} />;
				} else {
					const rendered = renderFormattedText(part.content);
					const isList = rendered.some((el) => isValidElement(el) && el.type === 'li');
					return <Fragment key={idx}>{isList ? <ul className="pl-4">{rendered}</ul> : rendered}</Fragment>;
				}
			})}
		</div>
	);
};
