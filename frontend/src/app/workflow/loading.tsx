export default function Loading() {
	return (
		<div className="h-dvh min-h-[800px] bg-dark p-8 text-foreground">
			<div className="mx-auto max-w-7xl animate-pulse">
				<div className="mb-12 h-8 w-48 rounded bg-gray-800" />

				<div className="mb-12 grid grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-32 rounded-xl bg-gray-800/50" />
					))}
				</div>

				<div className="mb-12 grid grid-cols-2 gap-8">
					<div className="h-96 rounded-xl bg-gray-800/50" />
					<div className="h-96 rounded-xl bg-gray-800/50" />
				</div>

				<div className="h-96 rounded-xl bg-gray-800/50" />
			</div>
		</div>
	);
}
