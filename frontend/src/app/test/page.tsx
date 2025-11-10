'use client';

import { useProtectAdminRoute } from '@/hooks/useProtectAdminRoute.hook';

export default function TestPage() {
	const { showData } = useProtectAdminRoute();

	if (!showData) return null;
	return (
		<div className="h-dvh w-dvw">
			<div className="mx-auto max-w-3xl space-y-4 p-4">
				<h1 className="text-2xl font-semibold">Test</h1>
			</div>
		</div>
	);
}
