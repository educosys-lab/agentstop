'use client';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { LinkElement } from '@/components/elements/LinkElement';

export default function Error({ reset }: { error: Error; reset: () => void }) {
	return (
		<div className="flex h-dvh min-h-[800px] flex-col items-center justify-center bg-dark p-8 text-foreground">
			<div className="max-w-4xl text-center">
				<h2 className="mb-4 text-3xl font-bold text-red-400">Mission Not Found</h2>
				<p className="mb-8 text-muted">The mission you're looking for doesn't exist or may have been removed</p>

				<ButtonElement
					onClick={() => reset()}
					title="Try again"
					variant="wrapper"
					className="rounded-lg bg-primary px-6 py-2 transition-colors hover:bg-blue-700"
				>
					Try Again
				</ButtonElement>

				<LinkElement
					href="/dashboard"
					title="Return to Dashboard"
					className="ml-4 rounded-lg bg-gray-800 px-6 py-2 transition-colors hover:bg-gray-700"
				>
					Return to Dashboard
				</LinkElement>
			</div>
		</div>
	);
}
