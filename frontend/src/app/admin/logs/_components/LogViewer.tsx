import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';

import { LogType } from '../page';
import { ButtonElement } from '@/components/elements/ButtonElement';

type LogViewerPropsType = {
	logs: LogType;
	deleteSelectedLogs: (path: string) => Promise<void>;
};

export default function LogViewer({ logs, deleteSelectedLogs }: LogViewerPropsType) {
	return (
		<div className="flex flex-col gap-10">
			{Object.keys(logs).map((level) => (
				<LevelSection key={level} level={level} sources={logs[level]} deleteSelectedLogs={deleteSelectedLogs} />
			))}
		</div>
	);
}

function LevelSection(props: {
	level: string;
	sources: { [source: string]: { [file: string]: string } };
	deleteSelectedLogs: (path: string) => Promise<void>;
}) {
	const { level, sources, deleteSelectedLogs } = props;

	const [open, setOpen] = useState(true);

	return (
		<div className="">
			<h4
				className="sticky top-0 z-30 flex cursor-pointer items-center gap-2 bg-background px-2 pb-3 pt-6"
				onClick={() => setOpen(!open)}
			>
				<ButtonElement
					onClick={async (event) => {
						event.stopPropagation();
						await deleteSelectedLogs(`${level}`);
					}}
					title={`Delete all logs for ${level}`}
					variant={'outline'}
					size={'icon'}
					className="size-max border-destructive p-1"
				>
					<Trash2Icon className="size-4" />
				</ButtonElement>
				{level.toUpperCase()} {open ? '▲' : '▼'}
			</h4>

			{open &&
				Object.keys(sources).map((source) => (
					<SourceSection
						key={source}
						level={level}
						source={source}
						files={sources[source]}
						deleteSelectedLogs={deleteSelectedLogs}
					/>
				))}
		</div>
	);
}

function SourceSection(props: {
	level: string;
	source: string;
	files: { [file: string]: string };
	deleteSelectedLogs: (path: string) => Promise<void>;
}) {
	const { level, source, files, deleteSelectedLogs } = props;

	const [open, setOpen] = useState(true);

	return (
		<div className="ml-4">
			<h5
				className="sticky top-16 z-20 flex cursor-pointer items-center gap-2 bg-background px-2 pb-3"
				onClick={() => setOpen(!open)}
			>
				<ButtonElement
					onClick={async (event) => {
						event.stopPropagation();
						await deleteSelectedLogs(`${level}/${source}`);
					}}
					title={`Delete all logs for ${source}`}
					variant={'outline'}
					size={'icon'}
					className="size-max border-destructive p-1"
				>
					<Trash2Icon className="size-4" />
				</ButtonElement>
				{source} {open ? '▲' : '▼'}
			</h5>

			{open &&
				Object.keys(files).map((file) => (
					<FileSection
						key={file}
						level={level}
						source={source}
						filename={file}
						content={files[file]}
						deleteSelectedLogs={deleteSelectedLogs}
					/>
				))}
		</div>
	);
}

function FileSection(props: {
	level: string;
	source: string;
	filename: string;
	content: string;
	deleteSelectedLogs: (path: string) => Promise<void>;
}) {
	const { level, source, filename, content, deleteSelectedLogs } = props;

	const [open, setOpen] = useState(false);

	return (
		<div className="ml-8">
			<h6
				className="sticky top-[104px] z-10 flex cursor-pointer items-center gap-2 bg-background px-2 pb-3"
				onClick={() => setOpen(!open)}
			>
				<ButtonElement
					onClick={async (event) => {
						event.stopPropagation();
						await deleteSelectedLogs(`${level}/${source}/${filename}`);
					}}
					title={`Delete log file ${filename}`}
					variant={'outline'}
					size={'icon'}
					className="size-max border-destructive p-1"
				>
					<Trash2Icon className="size-4" />
				</ButtonElement>
				{filename} {open ? '▲' : '▼'}
			</h6>

			{open && <pre className="whitespace-pre-wrap text-wrap break-all p-4">{content}</pre>}
		</div>
	);
}
