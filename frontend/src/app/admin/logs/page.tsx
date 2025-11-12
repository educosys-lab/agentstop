'use client';

import { useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';
import { omit } from 'lodash';

import LogViewer from './_components/LogViewer';
import { useAdmin } from '../_hooks/useAdmin.hook';

export type LogType = { [level: string]: { [source: string]: { [file: string]: string } } };

export default function LogsPage() {
	const { getLogs, deleteLogs } = useAdmin();

	const [logs, setLogs] = useState<LogType>({});

	const getAllLogs = async () => {
		const response = await getLogs();
		if (response.isError) return toast.error(response.message);
		setLogs(response.data);
	};

	const deleteSelectedLogs = async (path: string) => {
		const response = await deleteLogs(`${path}`);
		if (response.isError) {
			toast.error(response.message);
			return;
		}

		const pathParts = path.split('/');
		const level = pathParts[0];
		const source = pathParts[1];
		const file = pathParts[2];

		if (level && source && file) {
			setLogs((prev) => ({
				...prev,
				[level]: {
					...prev[level],
					[source]: omit(prev[level][source], file),
				},
			}));
			return;
		}

		if (level && source) {
			setLogs((prev) => ({
				...prev,
				[level]: omit(prev[level], source),
			}));
			return;
		}

		if (level) {
			setLogs((prev) => omit(prev, level));
			return;
		}
	};

	useLayoutEffect(() => {
		getAllLogs();
	}, []);

	return (
		<div className="flex flex-col gap-4 p-10">
			<h2>Logs</h2>
			<LogViewer logs={logs} deleteSelectedLogs={deleteSelectedLogs} />
		</div>
	);
}
