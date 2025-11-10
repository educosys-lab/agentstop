import { ReactNode } from 'react';

type Column<T> = {
	key: keyof T;
	label: string;
	render?: (value: any, row: T) => ReactNode;
};

type TableProps<T> = {
	columns: Column<T>[];
	data: T[];
	renderRowActions?: (row: T) => ReactNode;
};

export function Table<T>({ columns, data, renderRowActions }: TableProps<T>) {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-slate-700">
				<thead className="bg-slate-700/50">
					<tr>
						{columns.map((col) => (
							<th
								key={String(col.key)}
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
							>
								{col.label}
							</th>
						))}
						{renderRowActions && (
							<th scope="col" className="relative px-6 py-3">
								<span className="sr-only">Actions</span>
							</th>
						)}
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-700 bg-slate-800">
					{data.map((item, index) => (
						<tr
							key={(item as any).id || index}
							className="transition-colors duration-150 hover:bg-slate-700/30"
						>
							{columns.map((col) => (
								<td
									key={String(col.key)}
									className="whitespace-nowrap px-6 py-4 text-sm text-slate-300"
								>
									{col.render
										? col.render(item[col.key], item)
										: (item[col.key] as unknown as ReactNode)}
								</td>
							))}
							{renderRowActions && (
								<td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
									{renderRowActions(item)}
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
